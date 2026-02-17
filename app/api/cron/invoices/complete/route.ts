import { NextResponse } from 'next/server';

import { completeLeasedInvoice, getInvoiceById } from '@/lib/invoicing/service';

export const runtime = 'nodejs';

function isAuthorized(req: Request) {
  const expected = process.env.INVOICE_CRON_SECRET || '';
  if (!expected) return false;

  const authHeader = req.headers.get('authorization') || '';
  if (authHeader === `Bearer ${expected}`) return true;

  const url = new URL(req.url);
  const secret = url.searchParams.get('secret') || '';
  return secret === expected;
}

function decodeBase64ToBuffer(input?: string | null) {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const base64 = trimmed.includes(',') ? trimmed.split(',').pop() || '' : trimmed;
  if (!base64) return null;
  return Buffer.from(base64, 'base64');
}

type Body = {
  invoiceId: string;
  lockToken: string;
  invoiceNumber?: string | null;
  ettn?: string | null;
  pdfBase64?: string | null;
  xmlBase64?: string | null;
  providerPayload?: unknown;
};

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  if (!body?.invoiceId || !body?.lockToken) {
    return NextResponse.json({ error: 'invoiceId ve lockToken gerekli' }, { status: 400 });
  }

  try {
    await completeLeasedInvoice({
      invoiceId: body.invoiceId,
      lockToken: body.lockToken,
      invoiceNumber: body.invoiceNumber ?? null,
      ettn: body.ettn ?? null,
      pdfBuffer: decodeBase64ToBuffer(body.pdfBase64),
      xmlBuffer: decodeBase64ToBuffer(body.xmlBase64),
      providerPayload: body.providerPayload,
    });

    const invoice = await getInvoiceById(body.invoiceId);
    return NextResponse.json({ ok: true, item: invoice });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'İşlem başarısız';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

