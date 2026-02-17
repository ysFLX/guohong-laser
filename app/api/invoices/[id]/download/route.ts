import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getSignedInvoiceUrl } from '@/lib/invoicing/storage';

export const runtime = 'nodejs';

type InvoiceLookup = {
  id: string;
  status: string;
  pdfObjectPath: string | null;
  xmlObjectPath: string | null;
  order: { userId: string } | null;
};

const prismaInvoices = prisma as unknown as {
  invoice: {
    findUnique: (args: unknown) => Promise<InvoiceLookup | null>;
  };
};

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const invoice = await prismaInvoices.invoice.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      pdfObjectPath: true,
      xmlObjectPath: true,
      order: { select: { userId: true } },
    },
  });

  if (!invoice || !invoice.order) {
    return NextResponse.json({ error: 'Fatura bulunamadı' }, { status: 404 });
  }

  const isOwner = invoice.order.userId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  if (invoice.status !== 'ISSUED') {
    return NextResponse.json({ error: 'Fatura henüz hazır değil' }, { status: 409 });
  }

  const url = new URL(req.url);
  const file = (url.searchParams.get('file') || 'pdf').toLowerCase();
  const objectPath = file === 'xml' ? invoice.xmlObjectPath : invoice.pdfObjectPath;

  if (!objectPath) {
    return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 });
  }

  try {
    const signedUrl = await getSignedInvoiceUrl(objectPath, 60);
    const res = NextResponse.redirect(signedUrl, { status: 302 });
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fatura linki oluşturulamadı';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

