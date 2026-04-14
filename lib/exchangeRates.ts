import { prisma } from '@/lib/prisma';

const DEFAULT_USD_TRY_RATE = Number.parseFloat(process.env.USD_TRY_FALLBACK_RATE || '39');
const EXCHANGE_RATE_STALE_MS = 36 * 60 * 60 * 1000;

type ExchangeRateRow = {
  rate: number;
  effectiveDate: string | null;
  fetchedAt: Date;
  source: string;
};

type ExchangeRateDbRow = ExchangeRateRow | null;

const prismaExchangeRates = prisma as unknown as {
  exchangeRate: {
    findUnique: (args: unknown) => Promise<ExchangeRateDbRow>;
    upsert: (args: unknown) => Promise<unknown>;
  };
};

function normalizeCurrency(value: string | null | undefined) {
  return (value || 'TRY').trim().toUpperCase();
}

export function getFallbackUsdTryRate() {
  if (Number.isFinite(DEFAULT_USD_TRY_RATE) && DEFAULT_USD_TRY_RATE > 0) {
    return DEFAULT_USD_TRY_RATE;
  }
  return 39;
}

function extractFirstMatch(input: string, pattern: RegExp) {
  const match = input.match(pattern);
  return match?.[1]?.trim() || null;
}

export async function fetchUsdTryRateFromTcmb() {
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

export async function getUsdTryExchangeRate(): Promise<ExchangeRateRow> {
  let current: ExchangeRateDbRow = null;

  try {
    current = await prismaExchangeRates.exchangeRate.findUnique({
      where: {
        baseCurrency_quoteCurrency: {
          baseCurrency: 'USD',
          quoteCurrency: 'TRY',
        },
      },
      select: {
        rate: true,
        effectiveDate: true,
        fetchedAt: true,
        source: true,
      },
    });
  } catch (error: unknown) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code || '')
        : '';

    if (code !== 'P2021') {
      throw error;
    }
  }

  const hasLiveRow = !!current && Number.isFinite(current.rate) && current.rate > 0;
  const isFresh = !!current && current.source !== 'fallback' && Date.now() - current.fetchedAt.getTime() < EXCHANGE_RATE_STALE_MS;

  if (current && hasLiveRow && isFresh) {
    return current;
  }

  try {
    const latest = await fetchUsdTryRateFromTcmb();
    await saveUsdTryExchangeRate(latest);

    return {
      rate: latest.rate,
      effectiveDate: latest.effectiveDate ?? null,
      fetchedAt: new Date(),
      source: latest.source,
    };
  } catch {
    if (current && hasLiveRow) {
      return current;
    }
  }

  return {
    rate: getFallbackUsdTryRate(),
    effectiveDate: null,
    fetchedAt: new Date(0),
    source: 'fallback',
  };
}

export function convertUsdCentsToTryCents(usdCents: number, usdTryRate: number) {
  const safeUsdCents = Number.isFinite(usdCents) ? Math.max(0, Math.round(usdCents)) : 0;
  const safeRate = Number.isFinite(usdTryRate) && usdTryRate > 0 ? usdTryRate : getFallbackUsdTryRate();
  return Math.max(0, Math.round(safeUsdCents * safeRate));
}

export function resolveDisplayedPriceCents(priceCents: number, currency: string | null | undefined, usdTryRate: number) {
  return normalizeCurrency(currency) === 'USD' ? convertUsdCentsToTryCents(priceCents, usdTryRate) : priceCents;
}

export function resolveDisplayedCurrency(currency: string | null | undefined) {
  return normalizeCurrency(currency) === 'USD' ? 'TRY' : normalizeCurrency(currency);
}

export function resolveDisplayedSizeOptionPrices(
  sizeOptionPrices: unknown,
  currency: string | null | undefined,
  usdTryRate: number,
) {
  if (!sizeOptionPrices || typeof sizeOptionPrices !== 'object') return {};

  const source = sizeOptionPrices as Record<string, unknown>;
  const normalized: Record<string, number> = {};

  for (const [key, rawValue] of Object.entries(source)) {
    if (rawValue && typeof rawValue === 'object') {
      const entry = rawValue as Record<string, unknown>;
      const entryCents = typeof entry.priceCents === 'number' ? entry.priceCents : Number(entry.priceCents);
      const entryCurrency =
        typeof entry.currency === 'string'
          ? entry.currency
          : typeof entry.priceCurrency === 'string'
            ? entry.priceCurrency
            : currency;
      normalized[key] = resolveDisplayedPriceCents(
        Number.isFinite(entryCents) ? entryCents : 0,
        entryCurrency,
        usdTryRate,
      );
      continue;
    }

    const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue);
    normalized[key] = resolveDisplayedPriceCents(Number.isFinite(numericValue) ? numericValue : 0, currency, usdTryRate);
  }

  return normalized;
}

export async function saveUsdTryExchangeRate(params: {
  rate: number;
  source: string;
  effectiveDate?: string | null;
}) {
  const safeRate = Number.isFinite(params.rate) && params.rate > 0 ? params.rate : null;
  if (!safeRate) {
    throw new Error('Kur gecersiz');
  }

  try {
    await prismaExchangeRates.exchangeRate.upsert({
      where: {
        baseCurrency_quoteCurrency: {
          baseCurrency: 'USD',
          quoteCurrency: 'TRY',
        },
      },
      create: {
        baseCurrency: 'USD',
        quoteCurrency: 'TRY',
        rate: safeRate,
        source: params.source,
        effectiveDate: params.effectiveDate ?? null,
        fetchedAt: new Date(),
      },
      update: {
        rate: safeRate,
        source: params.source,
        effectiveDate: params.effectiveDate ?? null,
        fetchedAt: new Date(),
      },
    });
  } catch (error: unknown) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code || '')
        : '';

    if (code === 'P2021') {
      throw new Error('ExchangeRate tablosu bulunamadi. Once migration deploy et.');
    }

    throw error;
  }
}
