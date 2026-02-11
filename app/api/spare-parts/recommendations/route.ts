import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RecommendationRow = {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  stockOnHand: number;
  categoryId: string;
  category: { name: string; slug: string };
  images: Array<{ url: string }>;
};

type RecommendationItem = {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  stockOnHand: number;
  category: { name: string; slug: string };
  ratingAverage: number;
  ratingCount: number;
};

function parseIdsParam(raw: string) {
  if (!raw) return [];
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0 && value.length < 80)
    .slice(0, 25);
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}

function pickFirstImage(row: RecommendationRow) {
  return row.imageUrl ?? row.images?.[0]?.url ?? null;
}

async function loadRatings(partIds: string[]) {
  if (partIds.length === 0) return new Map<string, { average: number; count: number }>();

  const ratingRows = await prisma.sparePartReview.groupBy({
    by: ['sparePartId'],
    where: { sparePartId: { in: partIds }, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return new Map(
    ratingRows.map((row) => [
      row.sparePartId,
      {
        average: Number(row._avg.rating ?? 0),
        count: row._count.rating,
      },
    ]),
  );
}

async function loadPartsByIds(ids: string[]) {
  if (ids.length === 0) return [] as RecommendationRow[];

  const rows = await prisma.sparePart.findMany({
    where: { id: { in: ids }, isActive: true, stockOnHand: { gt: 0 } },
    select: {
      id: true,
      name: true,
      priceCents: true,
      currency: true,
      imageUrl: true,
      stockOnHand: true,
      categoryId: true,
      category: { select: { name: true, slug: true } },
      images: {
        select: { url: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        take: 1,
      },
    },
  });

  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as RecommendationRow[];
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cartIds = uniqueStrings(parseIdsParam(url.searchParams.get('ids') || ''));
    const rawLimit = Number(url.searchParams.get('limit') || 3);
    const limit = Math.max(1, Math.min(Number.isFinite(rawLimit) ? Math.floor(rawLimit) : 3, 6));

    const exclude = new Set(cartIds);
    let picked: RecommendationRow[] = [];

    if (cartIds.length > 0) {
      const orderIdRows = await prisma.orderItem.findMany({
        where: { sparePartId: { in: cartIds } },
        select: { orderId: true },
        orderBy: { createdAt: 'desc' },
        take: 200,
      });
      const orderIds = uniqueStrings(orderIdRows.map((row) => row.orderId));

      if (orderIds.length > 0) {
        const grouped = await prisma.orderItem.groupBy({
          by: ['sparePartId'],
          where: {
            orderId: { in: orderIds },
            sparePartId: { not: null, notIn: cartIds },
          },
          _count: { sparePartId: true },
          orderBy: { _count: { sparePartId: 'desc' } },
          take: 12,
        });

        const rankedIds = grouped
          .map((row) => row.sparePartId)
          .filter((value): value is string => typeof value === 'string');

        const rankedParts = await loadPartsByIds(rankedIds);
        for (const part of rankedParts) {
          if (picked.length >= limit) break;
          if (exclude.has(part.id)) continue;
          exclude.add(part.id);
          picked.push(part);
        }
      }

      if (picked.length < limit) {
        const cartParts = await prisma.sparePart.findMany({
          where: { id: { in: cartIds } },
          select: { categoryId: true },
        });
        const categoryIds = uniqueStrings(cartParts.map((part) => part.categoryId));

        if (categoryIds.length > 0) {
          const fallback = await prisma.sparePart.findMany({
            where: {
              isActive: true,
              stockOnHand: { gt: 0 },
              id: { notIn: Array.from(exclude) },
              categoryId: { in: categoryIds },
            },
            orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
            select: {
              id: true,
              name: true,
              priceCents: true,
              currency: true,
              imageUrl: true,
              stockOnHand: true,
              categoryId: true,
              category: { select: { name: true, slug: true } },
              images: {
                select: { url: true },
                orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
                take: 1,
              },
            },
            take: Math.max(0, limit - picked.length),
          });

          for (const part of fallback) {
            if (picked.length >= limit) break;
            if (exclude.has(part.id)) continue;
            exclude.add(part.id);
            picked.push(part);
          }
        }
      }
    }

    if (picked.length < limit) {
      const globalFallback = await prisma.sparePart.findMany({
        where: {
          isActive: true,
          stockOnHand: { gt: 0 },
          id: { notIn: Array.from(exclude) },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          name: true,
          priceCents: true,
          currency: true,
          imageUrl: true,
          stockOnHand: true,
          categoryId: true,
          category: { select: { name: true, slug: true } },
          images: {
            select: { url: true },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            take: 1,
          },
        },
        take: Math.max(0, limit - picked.length),
      });

      for (const part of globalFallback) {
        if (picked.length >= limit) break;
        if (exclude.has(part.id)) continue;
        exclude.add(part.id);
        picked.push(part);
      }
    }

    const ids = picked.map((part) => part.id);
    const ratingMap = await loadRatings(ids);

    const items = picked.map((part): RecommendationItem => {
      const rating = ratingMap.get(part.id) ?? { average: 0, count: 0 };
      return {
        id: part.id,
        name: part.name,
        priceCents: part.priceCents,
        currency: part.currency,
        imageUrl: pickFirstImage(part),
        stockOnHand: part.stockOnHand,
        category: {
          name: part.category.name,
          slug: part.category.slug,
        },
        ratingAverage: rating.average,
        ratingCount: rating.count,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('spare-parts:recommendations', error);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
