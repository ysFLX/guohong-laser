/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    minimumCacheTTL: 86400,
    formats: ['image/avif', 'image/webp'],
  },
  outputFileTracingIncludes: {
    '/api/admin/invoices/batch': ['assets/fonts/*.ttf', 'public/images/logoacik.png'],
  },
};

module.exports = nextConfig;
