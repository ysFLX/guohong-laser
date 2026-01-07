import { NextResponse } from 'next/server';

export const revalidate = 60;

import { prisma } from '@/lib/prisma';

type ApiSparePart = {
  id: string;
  name: string;
  description: string;
  dimensions: string | null;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  stockOnHand: number;
  isFeatured: boolean;
  ratingAverage: number;
  ratingCount: number;
  category: { id: string; name: string; slug: string };
};

type SparePartFindManyResult = Array<{
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
}>;

const prismaSpareParts = prisma as unknown as {
  sparePart: {
    findMany: (args: unknown) => Promise<SparePartFindManyResult>;
  };
};

export async function GET() {
  try {
    const ratingRows = await prisma.sparePartReview.groupBy({
      by: ['sparePartId'],
      where: { isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const ratingMap = new Map(
      ratingRows.map((row) => [
        row.sparePartId,
        {
          average: Number(row._avg.rating ?? 0),
          count: row._count.rating,
        },
      ]),
    );

    const items = await prismaSpareParts.sparePart.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: { category: true },
    });

    return NextResponse.json({
      items: items.map((p): ApiSparePart => {
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
      }),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
