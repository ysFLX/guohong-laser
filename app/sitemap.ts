import type { MetadataRoute } from 'next';

import { prisma } from '@/lib/prisma';
import { machineProducts } from '@/lib/machineCatalog';
import { getAbsoluteUrl } from '@/lib/seo';

type StaticRoute = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: StaticRoute[] = [
    { path: '/', changeFrequency: 'weekly', priority: 1 },
    { path: '/guohong-lazer', changeFrequency: 'weekly', priority: 0.95 },
    { path: '/guohong-lazer-konya', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/products', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/spare-parts', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/guohong-yedek-parca', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/lazer-kesim-makinesi-konya', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/quote', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.75 },
    { path: '/company', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/gallery', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/references', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/faq', changeFrequency: 'monthly', priority: 0.65 },
    { path: '/stock-request', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/shipping', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/returns', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/returns-request', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/kvkk', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/cookies', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/distance-sales', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/payment-security', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/legal', changeFrequency: 'yearly', priority: 0.3 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: getAbsoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const machineEntries: MetadataRoute.Sitemap = machineProducts.map((product) => ({
    url: getAbsoluteUrl(`/products/${product.id}`),
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
    url: getAbsoluteUrl(`/spare-parts/${item.id}`),
    lastModified: item.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticEntries, ...machineEntries, ...sparePartEntries];
}
