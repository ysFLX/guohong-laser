import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { verifyPaytrCallbackHash } from '@/lib/paytr';
import { enqueueInvoiceForOrder } from '@/lib/invoicing/service';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const form = await req.formData();
  const merchantOid = String(form.get('merchant_oid') || '').trim();
  const status = String(form.get('status') || '').trim().toLowerCase();
  const totalAmount = String(form.get('total_amount') || '').trim();
  const hash = String(form.get('hash') || '').trim();

  if (!merchantOid || !status || !totalAmount || !hash) {
    return new NextResponse('OK', { status: 200 });
  }

  const isValid = verifyPaytrCallbackHash({
    merchantOid,
    status,
    totalAmount,
    hash,
  });
  if (!isValid) {
    console.error('[paytr-callback] invalid hash for', merchantOid);
    return new NextResponse('OK', { status: 200 });
  }

  const nextStatus = status === 'success' ? 'PAID' : status === 'failed' ? 'FAILED' : 'PENDING';

  const order = await prisma.order.findFirst({
    where: { stripeSessionId: merchantOid },
    select: { id: true, status: true },
  });

  if (!order) {
    return new NextResponse('OK', { status: 200 });
  }

  if (order.status !== nextStatus) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: nextStatus },
    });
  }

  if (nextStatus === 'PAID') {
    await enqueueInvoiceForOrder({ orderId: order.id }).catch((error) => {
      console.error('[paytr-callback] invoice enqueue failed:', error);
    });
  }

  return new NextResponse('OK', { status: 200 });
}
