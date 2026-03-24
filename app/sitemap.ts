import type { MetadataRoute } from 'next';

import { prisma } from '@/lib/prisma';
import { machineProducts } from '@/lib/machineCatalog';

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
    '/guohong-lazer',
    '/guohong-lazer-konya',
    '/products',
    '/spare-parts',
    '/quote',
    '/shipping',
    '/returns',
    '/references',
    '/faq',
    '/stock-request',
    '/privacy',
    '/kvkk',
    '/cookies',
    '/distance-sales',
    '/payment-security',
    '/legal',
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

  const machineEntries: MetadataRoute.Sitemap = machineProducts.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
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

  return [...staticEntries, ...machineEntries, ...sparePartEntries];
}
