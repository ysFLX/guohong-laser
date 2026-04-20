import { NextResponse } from 'next/server';

import { failLeasedInvoice, getInvoiceById } from '@/lib/invoicing/service';

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

type Body = {
  invoiceId: string;
  lockToken: string;
  errorMessage: string;
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

  if (!body?.invoiceId || !body?.lockToken || !body?.errorMessage) {
    return NextResponse.json({ error: 'invoiceId, lockToken, errorMessage gerekli' }, { status: 400 });
  }

  try {
    await failLeasedInvoice({
      invoiceId: body.invoiceId,
      lockToken: body.lockToken,
      errorMessage: body.errorMessage,
    });
    const invoice = await getInvoiceById(body.invoiceId);
    return NextResponse.json({ ok: true, item: invoice });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ä°şlem başarısız';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


