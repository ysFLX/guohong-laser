import { NextResponse } from 'next/server';

import { leasePendingInvoices } from '@/lib/invoicing/service';

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

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const url = new URL(req.url);
  const limitRaw = url.searchParams.get('limit') || '';
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 1;

  try {
    const result = await leasePendingInvoices({ limit });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ä°şlem başarısız';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}


