import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isPaymentCheckoutEnabled } from '@/lib/checkoutMode';
import { convertUsdCentsToTryCents, getUsdTryExchangeRate } from '@/lib/exchangeRates';
import { buildPaytrCheckoutPayload, buildPaytrRedirectUrl, getUserIp } from '@/lib/paytr';
import { isSparePartDirectPurchaseEnabled } from '@/lib/sparePartSales';
import { normalizeSaleQuantity } from '@/lib/minimumSaleQuantity';
import { normalizeFulfillmentType } from '@/lib/orderFulfillment';
import { calculateGrossCents, calculateVatTotals } from '@/lib/vat';
import {
  getSparePartProductIdFromCartLineId,
  normalizeSparePartSizeOptionPricesMap,
} from '@/lib/sparePartSizeOptions';

type CheckoutItem = {
  id: string;
  quantity: number;
  name?: string;
  imageUrl?: string | null;
  variantValue?: string | null;
};

type SparePartRow = {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  hasSizeOptions: boolean;
  sizeOptions: string[];
  sizeOptionPrices: unknown;
  stockOnHand: number;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (!isPaymentCheckoutEnabled()) {
    return NextResponse.json(
      {
        error: 'Ödeme altyapısı şu an kapalı. Lütfen teklif iste veya WhatsApp hattını kullanın.',
        code: 'PAYMENTS_DISABLED',
      },
      { status: 503 },
    );
  }

  if (!isSparePartDirectPurchaseEnabled()) {
    return NextResponse.json(
      {
        error: 'Yedek parça satışı şu anda teklifle ilerliyor. Lütfen teklif oluşturun.',
        code: 'SPARE_PART_DIRECT_PURCHASE_DISABLED',
      },
      { status: 503 },
    );
  }

  let payload: {
    items?: CheckoutItem[];
    addressId?: string;
    billingAddressId?: string | null;
    fulfillmentType?: string | null;
  };
  try {
    payload = (await req.json()) as {
      items?: CheckoutItem[];
      addressId?: string;
      billingAddressId?: string | null;
      fulfillmentType?: string | null;
    };
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  const addressId = typeof payload.addressId === 'string' ? payload.addressId.trim() : '';
  const billingAddressId = typeof payload.billingAddressId === 'string' ? payload.billingAddressId.trim() : '';
  const fulfillmentType = normalizeFulfillmentType(payload.fulfillmentType);

  const cleanItems = items
    .filter((x) => x && typeof x.id === 'string' && typeof x.quantity === 'number')
    .map((x) => ({
      id: String(x.id).trim(),
      productId: getSparePartProductIdFromCartLineId(String(x.id).trim()),
      quantity: Math.max(1, Math.min(50, Math.floor(x.quantity))),
      name: typeof x.name === 'string' ? x.name.trim() : '',
      imageUrl: typeof x.imageUrl === 'string' ? x.imageUrl : null,
      variantValue: typeof x.variantValue === 'string' ? x.variantValue.trim() : '',
    }))
    .filter((x) => x.id.length > 0);

  if (!cleanItems.length) {
    return NextResponse.json({ error: 'Sepet bos' }, { status: 400 });
  }

  if (fulfillmentType === 'SHIPPING' && !addressId) {
    return NextResponse.json({ error: 'Adres secilmedi' }, { status: 400 });
  }

  const address =
    fulfillmentType === 'SHIPPING'
      ? await prisma.address.findFirst({
          where: { id: addressId, userId: session.user.id },
          select: { id: true },
        })
      : null;

  if (fulfillmentType === 'SHIPPING' && !address) {
    return NextResponse.json({ error: 'Adres bulunamadi' }, { status: 400 });
  }

  if (!billingAddressId) {
    return NextResponse.json({ error: 'Fatura adresi bulunamadi' }, { status: 400 });
  }

  if (billingAddressId) {
    const billingAddress = await prisma.address.findFirst({
      where: { id: billingAddressId, userId: session.user.id },
      select: { id: true },
    });

    if (!billingAddress) {
      return NextResponse.json({ error: 'Fatura adresi bulunamadi' }, { status: 400 });
    }
  }

  const ids = Array.from(new Set(cleanItems.map((item) => item.productId)));
  const parts = (await prisma.sparePart.findMany({
    where: { id: { in: ids }, isActive: true },
    select: {
      id: true,
      name: true,
      priceCents: true,
      currency: true,
      imageUrl: true,
      hasSizeOptions: true,
      sizeOptions: true,
      sizeOptionPrices: true,
      stockOnHand: true,
    },
  })) as SparePartRow[];
  const exchangeRate = await getUsdTryExchangeRate();

  const partMap = new Map(parts.map((part) => [part.id, part]));
  const verifiedItems = cleanItems
    .map((item) => {
      const part = partMap.get(item.productId);
      if (!part) return null;
      const sizeOptionPrices = normalizeSparePartSizeOptionPricesMap(
        part.sizeOptionPrices,
        part.sizeOptions,
        part.priceCents,
        part.currency,
      );
      if (part.hasSizeOptions) {
        const normalizedOptions = part.sizeOptions.map((option) => option.trim());
        if (!item.variantValue || !normalizedOptions.includes(item.variantValue)) {
          return null;
        }
      }
      const resolvedBasePriceCents =
        part.currency === 'USD' ? convertUsdCentsToTryCents(part.priceCents, exchangeRate.rate) : part.priceCents;
      const resolvedPriceCents =
        part.hasSizeOptions && item.variantValue && sizeOptionPrices[item.variantValue]?.currency === 'USD'
          ? convertUsdCentsToTryCents(sizeOptionPrices[item.variantValue].priceCents, exchangeRate.rate)
          : part.hasSizeOptions && item.variantValue
            ? sizeOptionPrices[item.variantValue]?.priceCents ?? resolvedBasePriceCents
            : resolvedBasePriceCents;
      return {
        id: part.id,
        name: item.name || part.name,
        priceCents: resolvedPriceCents,
        imageUrl: item.imageUrl || part.imageUrl,
        quantity: normalizeSaleQuantity(item.quantity, resolvedPriceCents),
        stockOnHand: part.stockOnHand,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (verifiedItems.length !== cleanItems.length) {
    return NextResponse.json({ error: 'Sepette gecersiz veya pasif ürün var.' }, { status: 400 });
  }

  const quantityByPartId = new Map<string, number>();
  for (const item of verifiedItems) {
    quantityByPartId.set(item.id, (quantityByPartId.get(item.id) || 0) + item.quantity);
  }

  const insufficientItem = verifiedItems.find((item) => {
    const requestedQuantity = quantityByPartId.get(item.id) || item.quantity;
    return requestedQuantity > item.stockOnHand;
  });

  if (insufficientItem) {
    return NextResponse.json(
      {
        error: `${insufficientItem.name} için stok yetersiz. Mevcut stok: ${Math.max(0, insufficientItem.stockOnHand)}.`,
        code: 'INSUFFICIENT_STOCK',
      },
      { status: 409 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const email = (session.user.email || '').trim();
  if (!email) {
    return NextResponse.json({ error: 'Ödeme için e-posta gerekli.' }, { status: 400 });
  }

  const selectedAddress = await prisma.address.findFirst({
    where: { id: fulfillmentType === 'PICKUP' ? billingAddressId : addressId, userId: session.user.id },
    select: {
      fullName: true,
      phone: true,
      line1: true,
      line2: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
    },
  });

  if (!selectedAddress) {
    return NextResponse.json({ error: 'Adres bulunamadi' }, { status: 400 });
  }

  const totals = calculateVatTotals(verifiedItems);
  const totalCents = totals.totalCents;
  if (totalCents <= 0) {
    return NextResponse.json({ error: 'Sepet tutari gecersiz' }, { status: 400 });
  }

  const merchantOid = `PAYTR${Date.now()}${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const displayName =
    selectedAddress.fullName ||
    (session.user.name || '').trim() ||
    'Musteri';
  const displayAddress = [
    selectedAddress.line1,
    selectedAddress.line2,
    selectedAddress.city,
    selectedAddress.state,
    selectedAddress.postalCode,
    selectedAddress.country,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
  const userPhone = (selectedAddress.phone || '').trim() || '+905000000000';
  const userBasket = verifiedItems.map(
    (item) => [item.name, (calculateGrossCents(item.priceCents) / 100).toFixed(2), item.quantity] as [string, string, number],
  );
  const okUrl = `${appUrl}/checkout/success?merchant_oid=${encodeURIComponent(merchantOid)}`;
  const failUrl = `${appUrl}/checkout/cancel?merchant_oid=${encodeURIComponent(merchantOid)}`;
  let orderId = '';

  const restoreReservedStock = async () => {
    if (!orderId) return;

    await prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: { id: orderId, status: 'PENDING' },
        data: { status: 'FAILED' },
      });

      for (const [sparePartId, quantity] of quantityByPartId.entries()) {
        if (quantity <= 0) continue;

        await tx.sparePart.update({
          where: { id: sparePartId },
          data: { stockOnHand: { increment: quantity } },
        });

        await tx.stockMovement.create({
          data: {
            sparePartId,
            delta: quantity,
            reason: 'RETURN',
            note: `paytr-release:${orderId}`,
            createdByUserId: null,
          },
        });
      }
    });
  };

  try {
    const createdOrder = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: session.user.id,
          status: 'PENDING',
          fulfillmentType,
          totalCents,
          currency: 'TRY',
          paymentSessionId: merchantOid,
          shippingAddressId: fulfillmentType === 'SHIPPING' ? addressId : null,
          billingAddressId,
          items: {
            create: verifiedItems.map((item) => ({
              name: item.name,
              imageUrl: item.imageUrl,
              quantity: item.quantity,
              priceCents: item.priceCents,
              sparePart: {
                connect: { id: item.id },
              },
            })),
          },
        },
        select: { id: true },
      });

      for (const [sparePartId, quantity] of quantityByPartId.entries()) {
        if (quantity <= 0) continue;

        const updated = await tx.sparePart.updateMany({
          where: { id: sparePartId, stockOnHand: { gte: quantity } },
          data: { stockOnHand: { decrement: quantity } },
        });

        if (updated.count !== 1) {
          throw new Error('INSUFFICIENT_STOCK');
        }

        await tx.stockMovement.create({
          data: {
            sparePartId,
            delta: -quantity,
            reason: 'SALE',
            note: `paytr-order:${created.id}`,
            createdByUserId: null,
          },
        });
      }

      return created;
    });
    orderId = createdOrder.id;

    const payload = buildPaytrCheckoutPayload({
      merchantOid,
      userIp: getUserIp(req),
      email,
      paymentAmount: totalCents,
      userBasket,
      userName: displayName,
      userAddress: displayAddress || 'Adres bilgisi',
      userPhone,
      merchantOkUrl: okUrl,
      merchantFailUrl: failUrl,
    });

    const paytrRes = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: payload.toString(),
      cache: 'no-store',
    });

    const paytrJson = (await paytrRes.json().catch(() => ({}))) as { status?: string; token?: string; reason?: string };
    if (!paytrRes.ok || paytrJson.status !== 'success' || !paytrJson.token) {
      console.error('[checkout] PAYTR get-token failed:', paytrJson);
      await restoreReservedStock().catch((error) => {
        console.error('[checkout] reserved stock restore failed:', error);
      });
      return NextResponse.json(
        { error: 'Ödeme başlatılamadı. Lütfen tekrar deneyin.', code: 'CHECKOUT_FAILED' },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: buildPaytrRedirectUrl(paytrJson.token), merchant_oid: merchantOid });
  } catch (error) {
    console.error('[checkout] PAYTR checkout create failed:', error);
    await restoreReservedStock().catch((restoreError) => {
      console.error('[checkout] reserved stock restore failed:', restoreError);
    });
    if (error instanceof Error && error.message === 'INSUFFICIENT_STOCK') {
      return NextResponse.json(
        { error: 'Sepetteki ürünlerden biri için stok yetersiz. Lütfen sepeti güncelleyin.', code: 'INSUFFICIENT_STOCK' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: 'Ödeme başlatılamadı. Lütfen tekrar deneyin.', code: 'CHECKOUT_FAILED' },
      { status: 500 },
    );
  }
}

