import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { saveUsdTryExchangeRate } from '@/lib/exchangeRates';

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

function extractFirstMatch(input: string, pattern: RegExp) {
  const match = input.match(pattern);
  return match?.[1]?.trim() || null;
}

async function fetchUsdTryRateFromTcmb() {
  const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml', {
    cache: 'no-store',
    headers: {
      Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.8',
      'User-Agent': 'guohongshop-exchange-rate-bot/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`TCMB istegi basarisiz: ${response.status}`);
  }

  const xml = await response.text();
  const usdBlockMatch = xml.match(/<Currency[^>]*CurrencyCode="USD"[\s\S]*?<\/Currency>/i);
  const usdBlock = usdBlockMatch?.[0] || '';
  if (!usdBlock) {
    throw new Error('USD kuru bulunamadi');
  }

  const banknoteSelling =
    extractFirstMatch(usdBlock, /<BanknoteSelling>([^<]+)<\/BanknoteSelling>/i) ||
    extractFirstMatch(usdBlock, /<ForexSelling>([^<]+)<\/ForexSelling>/i);

  if (!banknoteSelling) {
    throw new Error('USD satis kuru bulunamadi');
  }

  const normalized = banknoteSelling.replace(',', '.');
  const rate = Number.parseFloat(normalized);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('USD kuru gecersiz');
  }

  const effectiveDate =
    extractFirstMatch(xml, /<Tarih_Date[^>]*Date="([^"]+)"/i) ||
    extractFirstMatch(xml, /<Tarih_Date[^>]*Tarih="([^"]+)"/i);

  return {
    rate,
    effectiveDate,
    source: 'tcmb',
  };
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    const result = await fetchUsdTryRateFromTcmb();
    await saveUsdTryExchangeRate(result);

    revalidateTag('exchange-rate-usd-try');

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
