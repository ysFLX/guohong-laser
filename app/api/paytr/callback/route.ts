import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { verifyPaytrCallbackHash } from '@/lib/paytr';
import { enqueueInvoiceForOrder } from '@/lib/invoicing/service';
import { notifyOrderStatus, sendOrderConfirmationEmail } from '@/lib/orders/paymentNotifications';

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

  const nextStatus = status === 'success' ? 'RECEIVED' : status === 'failed' ? 'FAILED' : 'PENDING';

  const order = await prisma.order.findFirst({
    where: { paymentSessionId: merchantOid },
    select: { id: true, status: true, totalCents: true, userId: true },
  });

  if (!order) {
    return new NextResponse('OK', { status: 200 });
  }

  if (Number(totalAmount) !== order.totalCents) {
    console.error('[paytr-callback] total mismatch for', merchantOid);
    return new NextResponse('OK', { status: 200 });
  }

  const shouldNotify = order.status !== nextStatus;

  if (order.status !== nextStatus) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: nextStatus },
    });
  }

  if (nextStatus === 'RECEIVED') {
    if (shouldNotify) {
      await notifyOrderStatus({
        userId: order.userId,
        orderId: order.id,
        status: nextStatus,
        title: 'Siparişiniz alındı',
        message: 'PayTR ödemeniz tamamlandı. Siparişiniz işleme alındı.',
      });

      await sendOrderConfirmationEmail(order.id).catch((error) => {
        console.error('[paytr-callback] order email failed:', error);
      });
    }

    await enqueueInvoiceForOrder({ orderId: order.id }).catch((error) => {
      console.error('[paytr-callback] invoice enqueue failed:', error);
    });
  } else if (nextStatus === 'FAILED' && shouldNotify) {
    await notifyOrderStatus({
      userId: order.userId,
      orderId: order.id,
      status: nextStatus,
      title: 'Ödeme başarısız',
      message: 'PayTR ödeme işlemi tamamlanamadı. Sepetinden tekrar deneyebilirsin.',
    });
  }

  return new NextResponse('OK', { status: 200 });
}
