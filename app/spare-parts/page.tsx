import SparePartsPageClient, { type SparePart } from '@/components/spare-parts/SparePartsPageClient';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

export default async function SparePartsPage() {
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

    const parts = await prismaSpareParts.sparePart.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: { category: true },
    });

    const initialItems: SparePart[] = parts.map((p) => {
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

    return <SparePartsPageClient initialItems={initialItems} />;
  } catch (error) {
    console.error('spare-parts:page', error);
    return <SparePartsPageClient initialItems={[]} />;
  }
}

