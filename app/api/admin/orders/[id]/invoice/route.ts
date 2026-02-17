import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { enqueueInvoiceForOrder, getInvoiceById, processInvoiceById } from '@/lib/invoicing/service';

export const runtime = 'nodejs';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  let processNow = true;
  try {
    const body = (await req.json()) as { processNow?: boolean };
    if (typeof body.processNow === 'boolean') {
      processNow = body.processNow;
    }
  } catch {
    // no body
  }

  try {
    const invoice = await enqueueInvoiceForOrder({ orderId: id });
    if (processNow) {
      await processInvoiceById({ invoiceId: invoice.id });
    }
    const refreshed = await getInvoiceById(invoice.id);
    return NextResponse.json({ item: refreshed });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fatura işlemi başarısız';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
