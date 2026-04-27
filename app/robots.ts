import type { MetadataRoute } from 'next';

import { getAbsoluteUrl, getSiteHost } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/profile',
          '/checkout',
          '/cart',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/complete-profile',
        ],
      },
    ],
    host: getSiteHost(),
    sitemap: getAbsoluteUrl('/sitemap.xml'),
  };
}
