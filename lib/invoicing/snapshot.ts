import { prisma } from '@/lib/prisma';

import type { InvoiceSnapshot } from '@/lib/invoicing/types';

type OrderRow = {
  id: string;
  userId: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: Date;
  user: { name: string | null; email: string | null; phone: string | null } | null;
  items: Array<{
    name: string;
    quantity: number;
    priceCents: number;
    sparePart: { sku: string | null } | null;
  }>;
  shippingAddress: {
    label: string | null;
    fullName: string | null;
    phone: string | null;
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  } | null;
  billingAddress: {
    label: string | null;
    fullName: string | null;
    phone: string | null;
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
    invoiceType: 'INDIVIDUAL' | 'COMPANY';
    companyName: string | null;
    taxOffice: string | null;
    taxNumber: string | null;
    identityNumber: string | null;
  } | null;
};

const prismaOrders = prisma as unknown as {
  order: {
    findUnique: (args: unknown) => Promise<OrderRow | null>;
  };
};

export async function buildInvoiceSnapshotForOrder(orderId: string): Promise<InvoiceSnapshot> {
  const order = await prismaOrders.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: { select: { name: true, quantity: true, priceCents: true, sparePart: { select: { sku: true } } } },
      shippingAddress: {
        select: {
          label: true,
          fullName: true,
          phone: true,
          line1: true,
          line2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
        },
      },
      billingAddress: {
        select: {
          label: true,
          fullName: true,
          phone: true,
          line1: true,
          line2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          invoiceType: true,
          companyName: true,
          taxOffice: true,
          taxNumber: true,
          identityNumber: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error('Sipariş bulunamadı');
  }

  return {
    order: {
      id: order.id,
      createdAt: order.createdAt.toISOString(),
      status: order.status,
      totalCents: order.totalCents,
      currency: order.currency,
    },
    customer: {
      id: order.userId,
      name: order.user?.name ?? null,
      email: order.user?.email ?? null,
      phone: order.user?.phone ?? null,
    },
    items: (order.items || []).map((item) => ({
      sku: item.sparePart?.sku ?? null,
      name: item.name,
      quantity: item.quantity,
      priceCents: item.priceCents,
    })),
    shippingAddress: order.shippingAddress
      ? {
          label: order.shippingAddress.label ?? null,
          fullName: order.shippingAddress.fullName ?? null,
          phone: order.shippingAddress.phone ?? null,
          line1: order.shippingAddress.line1 ?? null,
          line2: order.shippingAddress.line2 ?? null,
          city: order.shippingAddress.city ?? null,
          state: order.shippingAddress.state ?? null,
          postalCode: order.shippingAddress.postalCode ?? null,
          country: order.shippingAddress.country ?? null,
        }
      : null,
    billingAddress: order.billingAddress
      ? {
          label: order.billingAddress.label ?? null,
          fullName: order.billingAddress.fullName ?? null,
          phone: order.billingAddress.phone ?? null,
          line1: order.billingAddress.line1 ?? null,
          line2: order.billingAddress.line2 ?? null,
          city: order.billingAddress.city ?? null,
          state: order.billingAddress.state ?? null,
          postalCode: order.billingAddress.postalCode ?? null,
          country: order.billingAddress.country ?? null,
          invoiceType: order.billingAddress.invoiceType ?? 'INDIVIDUAL',
          companyName: order.billingAddress.companyName ?? null,
          taxOffice: order.billingAddress.taxOffice ?? null,
          taxNumber: order.billingAddress.taxNumber ?? null,
          identityNumber: order.billingAddress.identityNumber ?? null,
        }
      : null,
  };
}
