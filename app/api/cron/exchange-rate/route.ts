import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { fetchUsdTryRateFromTcmb, saveUsdTryExchangeRate } from '@/lib/exchangeRates';

export const runtime = 'nodejs';

function isAuthorized(req: Request) {
  if (req.headers.get('x-vercel-cron') === '1') return true;

  const expected = process.env.CRON_SECRET || process.env.EXCHANGE_RATE_CRON_SECRET || '';
  if (!expected) return false;

  const headerSecret = req.headers.get('x-cron-secret') || '';
  if (headerSecret === expected) return true;

  const authHeader = req.headers.get('authorization') || '';
  if (authHeader === `Bearer ${expected}`) return true;

  const url = new URL(req.url);
  const secret = url.searchParams.get('secret') || '';
  if (secret === expected) return true;

  return false;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    const result = await fetchUsdTryRateFromTcmb();
    await saveUsdTryExchangeRate(result);

    revalidateTag('exchange-rate-usd-try', 'max');

    return NextResponse.json({
      ok: true,
      baseCurrency: 'USD',
      quoteCurrency: 'TRY',
      rate: result.rate,
      source: result.source,
      effectiveDate: result.effectiveDate,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kur guncellenemedi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
