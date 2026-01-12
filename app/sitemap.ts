import type { MetadataRoute } from 'next';

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
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

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}
