import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { getUsdTryExchangeRate, resolveDisplayedCurrency, resolveDisplayedPriceCents } from '@/lib/exchangeRates';
import { prisma } from '@/lib/prisma';

const prismaAny = prisma as unknown as { favorite?: unknown };

function missingFavoriteModel() {
  return !prismaAny.favorite;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (missingFavoriteModel()) {
    return NextResponse.json(
      { error: 'Favoriler tablosu hazır değil. Prisma migrate/generate çalıştır.' },
      { status: 500 }
    );
  }

  try {
    const exchangeRate = await getUsdTryExchangeRate();
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        sparePart: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      items: favorites.map((item) => ({
        ...item,
        sparePart: item.sparePart
          ? {
              ...item.sparePart,
              priceCents: resolveDisplayedPriceCents(item.sparePart.priceCents, item.sparePart.currency, exchangeRate.rate),
              currency: resolveDisplayedCurrency(item.sparePart.currency),
            }
          : item.sparePart,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Favoriler alınamadı';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (missingFavoriteModel()) {
    return NextResponse.json(
      { error: 'Favoriler tablosu hazır değil. Prisma migrate/generate çalıştır.' },
      { status: 500 }
    );
  }

  const body = await request.json();
  const sparePartId = typeof body.sparePartId === 'string' ? body.sparePartId : '';

  if (!sparePartId) {
    return NextResponse.json({ error: 'sparePartId gerekli' }, { status: 400 });
  }

  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_sparePartId: { userId: session.user.id, sparePartId } },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { userId_sparePartId: { userId: session.user.id, sparePartId } },
      });
      return NextResponse.json({ favorited: false });
    }

    await prisma.favorite.create({
      data: { userId: session.user.id, sparePartId },
    });

    return NextResponse.json({ favorited: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Favori güncellenemedi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

