import { NextResponse } from 'next/server';

import { enqueueInvoiceForOrder } from '@/lib/invoicing/service';
import { notifyOrderStatus, sendOrderConfirmationEmail } from '@/lib/orders/paymentNotifications';
import { verifyPaytrCallbackHash } from '@/lib/paytr';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

async function releaseReservedStock(order: {
  id: string;
  items: Array<{ sparePartId: string | null; quantity: number }>;
}) {
  const reserveNote = `paytr-order:${order.id}`;
  const releaseNote = `paytr-release:${order.id}`;

  await prisma.$transaction(async (tx) => {
    const [reservedCount, releasedCount] = await Promise.all([
      tx.stockMovement.count({ where: { note: reserveNote, delta: { lt: 0 } } }),
      tx.stockMovement.count({ where: { note: releaseNote, delta: { gt: 0 } } }),
    ]);

    if (reservedCount === 0 || releasedCount > 0) return;

    const quantityByPartId = new Map<string, number>();
    for (const item of order.items) {
      if (!item.sparePartId) continue;
      quantityByPartId.set(item.sparePartId, (quantityByPartId.get(item.sparePartId) || 0) + item.quantity);
    }

    for (const [sparePartId, quantity] of quantityByPartId.entries()) {
      if (quantity <= 0) continue;

      await tx.sparePart.update({
        where: { id: sparePartId },
        data: { stockOnHand: { increment: quantity } },
      });

      await tx.stockMovement.create({
        data: {
          sparePartId,
          delta: quantity,
          reason: 'RETURN',
          note: releaseNote,
          createdByUserId: null,
        },
      });
    }
  });
}

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

  try {
    const order = await prisma.order.findFirst({
      where: { paymentSessionId: merchantOid },
      select: {
        id: true,
        status: true,
        totalCents: true,
        userId: true,
        items: {
          select: {
            sparePartId: true,
            quantity: true,
          },
        },
      },
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
    } else if (nextStatus === 'FAILED') {
      await releaseReservedStock(order).catch((error) => {
        console.error('[paytr-callback] reserved stock release failed:', error);
      });

      if (shouldNotify) {
        await notifyOrderStatus({
          userId: order.userId,
          orderId: order.id,
          status: nextStatus,
          title: 'Ödeme başarısız',
          message: 'PayTR ödeme işlemi tamamlanamadı. Sepetinden tekrar deneyebilirsin.',
        });
      }
    }
  } catch (error) {
    console.error('[paytr-callback] processing failed:', error);
  }

  return new NextResponse('OK', { status: 200 });
}
