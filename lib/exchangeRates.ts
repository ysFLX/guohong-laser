import { prisma } from '@/lib/prisma';

const DEFAULT_USD_TRY_RATE = Number.parseFloat(process.env.USD_TRY_FALLBACK_RATE || '39');

type ExchangeRateRow = {
  rate: number;
  effectiveDate: string | null;
  fetchedAt: Date;
  source: string;
} | null;

const prismaExchangeRates = prisma as unknown as {
  exchangeRate: {
    findUnique: (args: unknown) => Promise<ExchangeRateRow>;
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

export async function getUsdTryExchangeRate() {
  let current: ExchangeRateRow = null;

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

  if (current && Number.isFinite(current.rate) && current.rate > 0) {
    return current;
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
    const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue);
    normalized[key] = resolveDisplayedPriceCents(
      Number.isFinite(numericValue) ? numericValue : 0,
      currency,
      usdTryRate,
    );
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
