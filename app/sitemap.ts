import type { MetadataRoute } from 'next';

import { prisma } from '@/lib/prisma';

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const staticRoutes = [
    '',
    '/about',
    '/company',
    '/contact',
    '/gallery',
    '/products',
    '/spare-parts',
    '/quote',
    '/shipping',
    '/returns',
    '/stock-request',
    '/privacy',
    '/kvkk',
    '/cookies',
    '/distance-sales',
    '/payment-security',
    '/returns-request',
    '/login',
    '/register',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));

  const prismaAny = prisma as unknown as {
    sparePart: {
      findMany: (args: unknown) => Promise<{ id: string; updatedAt: Date }[]>;
    };
  };

  const spareParts = await prismaAny.sparePart.findMany({
    select: { id: true, updatedAt: true },
  });

  const sparePartEntries: MetadataRoute.Sitemap = spareParts.map((item) => ({
    url: `${baseUrl}/spare-parts/${item.id}`,
    lastModified: item.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticEntries, ...sparePartEntries];
}
