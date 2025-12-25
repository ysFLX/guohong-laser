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
    const items = await prismaSpareParts.sparePart.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: { category: true },
    });

    return NextResponse.json({
      items: items.map((p): ApiSparePart => ({
        id: p.id,
        name: p.name,
        description: p.description,
        dimensions: p.dimensions,
        priceCents: p.priceCents,
        currency: p.currency,
        imageUrl: p.imageUrl,
        stockOnHand: p.stockOnHand,
        isFeatured: p.isFeatured,
        category: {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
        },
      })),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
