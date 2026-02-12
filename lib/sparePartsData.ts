import { unstable_cache } from 'next/cache';

import type { SparePart } from '@/components/spare-parts/SparePartsPageClient';
import { prisma } from '@/lib/prisma';

type RatingMapValue = { average: number; count: number };

type SparePartListRow = {
  id: string;
  name: string;
  description: string;
  dimensions: string | null;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  stockOnHand: number;
  isFeatured: boolean;
  createdAt: Date;
  category: { id: string; name: string; slug: string };
};

type SparePartDetailRow = {
  id: string;
  name: string;
  description: string;
  dimensions: string | null;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  stockOnHand: number;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string };
  images: Array<{ id: string; url: string }>;
} | null;

type RelatedPart = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  category: { name: string };
};

const prismaSpareParts = prisma as unknown as {
  sparePart: {
    findMany: (args: unknown) => Promise<SparePartListRow[]>;
    findUnique: (args: unknown) => Promise<SparePartDetailRow>;
  };
};

function toRatingMap(
  ratingRows: Array<{
    sparePartId: string;
    _avg: { rating: number | null };
    _count: { rating: number };
  }>,
) {
  return new Map<string, RatingMapValue>(
    ratingRows.map((row) => [
      row.sparePartId,
      {
        average: Number(row._avg.rating ?? 0),
        count: row._count.rating,
      },
    ]),
  );
}

export const getActiveSparePartsWithRatings = unstable_cache(
  async (): Promise<SparePart[]> => {
    const [ratingRows, parts] = await Promise.all([
      prisma.sparePartReview.groupBy({
        by: ['sparePartId'],
        where: { isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prismaSpareParts.sparePart.findMany({
        where: { isActive: true },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: { category: true },
      }),
    ]);

    const ratingMap = toRatingMap(ratingRows);
    return parts.map((p) => {
      const rating = ratingMap.get(p.id) ?? { average: 0, count: 0 };
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        dimensions: p.dimensions,
        priceCents: p.priceCents,
        currency: p.currency,
        imageUrl: p.imageUrl,
        stockOnHand: p.stockOnHand,
        isFeatured: p.isFeatured,
        ratingAverage: rating.average,
        ratingCount: rating.count,
        category: {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
        },
      };
    });
  },
  ['spare-parts:list:v1'],
  { revalidate: 60, tags: ['spare-part-reviews'] },
);

export const getSparePartById = unstable_cache(
  async (id: string): Promise<NonNullable<SparePartDetailRow>> => {
    const part = await prismaSpareParts.sparePart.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
      },
    });

    if (!part) {
      throw new Error('Spare part not found');
    }

    return part;
  },
  ['spare-parts:detail:v1'],
  { revalidate: 60 },
);

export const getSparePartReviewSummary = unstable_cache(
  async (sparePartId: string) => {
    const summary = await prisma.sparePartReview.aggregate({
      where: { sparePartId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      ratingCount: summary._count.rating ?? 0,
      ratingAverage: Number(summary._avg.rating ?? 0),
    };
  },
  ['spare-parts:review-summary:v1'],
  { revalidate: 60, tags: ['spare-part-reviews'] },
);

export const getRelatedSpareParts = unstable_cache(
  async (categoryId: string, excludeId: string) => {
    return prismaSpareParts.sparePart.findMany({
      where: {
        category: { id: categoryId },
        NOT: { id: excludeId },
      },
      take: 3,
      select: {
        id: true,
        name: true,
        priceCents: true,
        imageUrl: true,
        category: { select: { name: true } },
      },
    });
  },
  ['spare-parts:related:v1'],
  { revalidate: 300 },
);

export const getBoughtTogetherSpareParts = unstable_cache(
  async (sparePartId: string) => {
    const orderIdRows = await prisma.orderItem.findMany({
      where: { sparePartId },
      select: { orderId: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const orderIds = Array.from(new Set(orderIdRows.map((row) => row.orderId)));
    if (orderIds.length === 0) return [] as RelatedPart[];

    const coItems = await prisma.orderItem.findMany({
      where: {
        orderId: { in: orderIds },
        sparePartId: { not: null },
        NOT: { sparePartId },
      },
      select: {
        sparePartId: true,
        sparePart: {
          select: {
            id: true,
            name: true,
            priceCents: true,
            imageUrl: true,
            category: { select: { name: true } },
          },
        },
      },
      take: 800,
    });

    const counts = new Map<string, { item: RelatedPart; count: number }>();
    for (const item of coItems) {
      if (!item.sparePartId || !item.sparePart) continue;
      const existing = counts.get(item.sparePartId);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(item.sparePartId, { item: item.sparePart, count: 1 });
      }
    }

    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .map((entry) => entry.item)
      .slice(0, 3);
  },
  ['spare-parts:bought-together:v1'],
  { revalidate: 600 },
);
