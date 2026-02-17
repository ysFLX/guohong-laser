import crypto from 'crypto';

import { prisma } from '@/lib/prisma';
import { buildInvoiceSnapshotForOrder } from '@/lib/invoicing/snapshot';
import { issueInvoiceWithProvider } from '@/lib/invoicing/provider';
import { uploadInvoiceObject } from '@/lib/invoicing/storage';

import type { InvoiceProvider, InvoiceSnapshot, InvoiceStatus } from '@/lib/invoicing/types';

const LOCK_TTL_MS = 5 * 60 * 1000;

type InvoiceRow = {
  id: string;
  orderId: string;
  provider: InvoiceProvider;
  status: InvoiceStatus;
  snapshot: InvoiceSnapshot | null;
  attemptCount: number;
  nextAttemptAt: Date | null;
  lockedAt: Date | null;
  lockedBy: string | null;
  errorMessage: string | null;
  issuedAt: Date | null;
  invoiceNumber: string | null;
  ettn: string | null;
  pdfObjectPath: string | null;
  xmlObjectPath: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type OrderStatusLookup = { id: string; status: string };

const prismaInvoices = prisma as unknown as {
  invoice: {
    findUnique: (args: unknown) => Promise<InvoiceRow | null>;
    findFirst: (args: unknown) => Promise<InvoiceRow | null>;
    create: (args: unknown) => Promise<InvoiceRow>;
    update: (args: unknown) => Promise<InvoiceRow>;
    updateMany: (args: unknown) => Promise<{ count: number }>;
  };
  order: {
    findUnique: (args: unknown) => Promise<OrderStatusLookup | null>;
  };
};

function canIssueInvoiceForOrderStatus(status: string) {
  return status === 'RECEIVED' || status === 'PAID' || status === 'SHIPPED' || status === 'IN_TRANSIT' || status === 'DELIVERED';
}

export async function enqueueInvoiceForOrder(params: {
  orderId: string;
  provider?: InvoiceProvider;
}) {
  const provider = params.provider || 'MIKRO_EPORTAL';

  const order = await prismaInvoices.order.findUnique({
    where: { id: params.orderId },
    select: { id: true, status: true },
  });

  if (!order) {
    throw new Error('Sipariş bulunamadı');
  }

  if (!canIssueInvoiceForOrderStatus(order.status)) {
    throw new Error('Sipariş henüz faturalandırılamaz (ödeme alınmadı).');
  }

  const snapshot = await buildInvoiceSnapshotForOrder(order.id);
  const now = new Date();

  const existing = await prismaInvoices.invoice.findUnique({
    where: { orderId: order.id },
  });

  if (!existing) {
    return prismaInvoices.invoice.create({
      data: {
        orderId: order.id,
        provider,
        status: 'PENDING',
        snapshot,
        attemptCount: 0,
        nextAttemptAt: now,
        errorMessage: null,
      },
    });
  }

  if (existing.status === 'ISSUED') {
    return existing;
  }

  return prismaInvoices.invoice.update({
    where: { id: existing.id },
    data: {
      provider,
      status: 'PENDING',
      snapshot,
      nextAttemptAt: now,
      errorMessage: null,
      lockedAt: null,
      lockedBy: null,
    },
  });
}

function computeNextAttempt(attemptCount: number) {
  const minutes = Math.min(60, 2 ** Math.min(6, attemptCount));
  return new Date(Date.now() + minutes * 60 * 1000);
}

export async function processInvoiceById(params: { invoiceId: string }) {
  const invoice = await prismaInvoices.invoice.findUnique({
    where: { id: params.invoiceId },
  });
  if (!invoice) {
    throw new Error('Fatura kaydı bulunamadı');
  }

  await processInvoiceRow(invoice);

  return prismaInvoices.invoice.findUnique({ where: { id: invoice.id } });
}

export async function getInvoiceById(invoiceId: string) {
  return prismaInvoices.invoice.findUnique({ where: { id: invoiceId } });
}

async function acquireLock(invoiceId: string) {
  const now = new Date();
  const expiredBefore = new Date(now.getTime() - LOCK_TTL_MS);
  const lockToken = crypto.randomUUID();

  const locked = await prismaInvoices.invoice.updateMany({
    where: {
      id: invoiceId,
      status: { in: ['PENDING', 'FAILED'] },
      OR: [{ lockedAt: null }, { lockedAt: { lt: expiredBefore } }],
    },
    data: {
      lockedAt: now,
      lockedBy: lockToken,
      status: 'PROCESSING',
      lastAttemptAt: now,
      attemptCount: { increment: 1 },
      errorMessage: null,
    },
  } as any);

  return { ok: locked.count === 1, lockToken };
}

async function releaseLock(invoiceId: string, lockToken: string) {
  await prismaInvoices.invoice.updateMany({
    where: { id: invoiceId, lockedBy: lockToken },
    data: { lockedAt: null, lockedBy: null },
  } as any);
}

async function processInvoiceRow(invoice: InvoiceRow) {
  const { ok, lockToken } = await acquireLock(invoice.id);
  if (!ok) return;

  try {
    const snapshot = invoice.snapshot || (await buildInvoiceSnapshotForOrder(invoice.orderId));

    const result = await issueInvoiceWithProvider({
      provider: invoice.provider,
      snapshot,
    });

    const uploadedAt = new Date();
    const pdfPath =
      result.pdfBuffer && result.pdfBuffer.length > 0
        ? await uploadInvoiceObject({
            objectPath: `invoices/${invoice.orderId}/${invoice.id}.pdf`,
            contentType: 'application/pdf',
            data: result.pdfBuffer,
          })
        : null;

    const xmlPath =
      result.xmlBuffer && result.xmlBuffer.length > 0
        ? await uploadInvoiceObject({
            objectPath: `invoices/${invoice.orderId}/${invoice.id}.xml`,
            contentType: 'application/xml',
            data: result.xmlBuffer,
          })
        : null;

    await prismaInvoices.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'ISSUED',
        snapshot,
        issuedAt: uploadedAt,
        invoiceNumber: result.invoiceNumber || null,
        ettn: result.ettn || null,
        pdfObjectPath: pdfPath,
        xmlObjectPath: xmlPath,
        providerPayload: result.providerPayload ?? null,
        lockedAt: null,
        lockedBy: null,
        nextAttemptAt: null,
        errorMessage: null,
      },
    } as any);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fatura oluşturma hatası';
    const nextAttemptAt = computeNextAttempt(invoice.attemptCount + 1);
    await prismaInvoices.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'FAILED',
        errorMessage: message,
        nextAttemptAt,
        lockedAt: null,
        lockedBy: null,
      },
    } as any);
  } finally {
    await releaseLock(invoice.id, lockToken);
  }
}

export async function processPendingInvoices(params: { limit?: number }) {
  const limit = Math.max(1, Math.min(25, params.limit ?? 10));
  const now = new Date();
  const expiredBefore = new Date(now.getTime() - LOCK_TTL_MS);

  const processed: string[] = [];

  for (let i = 0; i < limit; i += 1) {
    const candidate = await prismaInvoices.invoice.findFirst({
      where: {
        status: { in: ['PENDING', 'FAILED'] },
        AND: [
          { OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }] },
          { OR: [{ lockedAt: null }, { lockedAt: { lt: expiredBefore } }] },
        ],
      },
      orderBy: [{ nextAttemptAt: 'asc' }, { createdAt: 'asc' }],
    });

    if (!candidate) break;

    await processInvoiceRow(candidate);
    processed.push(candidate.id);
  }

  return { processed };
}

export async function leasePendingInvoices(params: { limit?: number }) {
  const limit = Math.max(1, Math.min(10, params.limit ?? 1));
  const now = new Date();
  const expiredBefore = new Date(now.getTime() - LOCK_TTL_MS);

  const items: Array<{ invoice: InvoiceRow; lockToken: string }> = [];

  for (let i = 0; i < limit; i += 1) {
    const candidate = await prismaInvoices.invoice.findFirst({
      where: {
        status: { in: ['PENDING', 'FAILED'] },
        AND: [
          { OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }] },
          { OR: [{ lockedAt: null }, { lockedAt: { lt: expiredBefore } }] },
        ],
      },
      orderBy: [{ nextAttemptAt: 'asc' }, { createdAt: 'asc' }],
    });

    if (!candidate) break;

    const { ok, lockToken } = await acquireLock(candidate.id);
    if (!ok) continue;

    const locked = await prismaInvoices.invoice.findUnique({ where: { id: candidate.id } });
    if (!locked) continue;

    items.push({ invoice: locked, lockToken });
  }

  return { items };
}

export async function completeLeasedInvoice(params: {
  invoiceId: string;
  lockToken: string;
  invoiceNumber?: string | null;
  ettn?: string | null;
  pdfBuffer?: Buffer | null;
  xmlBuffer?: Buffer | null;
  providerPayload?: unknown;
}) {
  const invoice = await prismaInvoices.invoice.findUnique({ where: { id: params.invoiceId } });
  if (!invoice) {
    throw new Error('Fatura kaydı bulunamadı');
  }

  if (invoice.lockedBy !== params.lockToken || invoice.status !== 'PROCESSING') {
    throw new Error('Fatura kilidi geçersiz (yeniden deneyin).');
  }

  const uploadedAt = new Date();

  const pdfPath =
    params.pdfBuffer && params.pdfBuffer.length > 0
      ? await uploadInvoiceObject({
          objectPath: `invoices/${invoice.orderId}/${invoice.id}.pdf`,
          contentType: 'application/pdf',
          data: params.pdfBuffer,
        })
      : invoice.pdfObjectPath;

  const xmlPath =
    params.xmlBuffer && params.xmlBuffer.length > 0
      ? await uploadInvoiceObject({
          objectPath: `invoices/${invoice.orderId}/${invoice.id}.xml`,
          contentType: 'application/xml',
          data: params.xmlBuffer,
        })
      : invoice.xmlObjectPath;

  await prismaInvoices.invoice.update({
    where: { id: invoice.id },
    data: {
      status: 'ISSUED',
      issuedAt: uploadedAt,
      invoiceNumber: params.invoiceNumber || invoice.invoiceNumber || null,
      ettn: params.ettn || invoice.ettn || null,
      pdfObjectPath: pdfPath,
      xmlObjectPath: xmlPath,
      providerPayload: (params.providerPayload ?? null) as any,
      lockedAt: null,
      lockedBy: null,
      nextAttemptAt: null,
      errorMessage: null,
    },
  } as any);
}

export async function failLeasedInvoice(params: {
  invoiceId: string;
  lockToken: string;
  errorMessage: string;
}) {
  const invoice = await prismaInvoices.invoice.findUnique({ where: { id: params.invoiceId } });
  if (!invoice) {
    throw new Error('Fatura kaydı bulunamadı');
  }

  if (invoice.lockedBy !== params.lockToken || invoice.status !== 'PROCESSING') {
    throw new Error('Fatura kilidi geçersiz (yeniden deneyin).');
  }

  const nextAttemptAt = computeNextAttempt(invoice.attemptCount);

  await prismaInvoices.invoice.update({
    where: { id: invoice.id },
    data: {
      status: 'FAILED',
      errorMessage: params.errorMessage,
      nextAttemptAt,
      lockedAt: null,
      lockedBy: null,
    },
  } as any);
}
