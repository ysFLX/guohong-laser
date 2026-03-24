import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
    minimumCacheTTL: 86400,
    formats: ["image/avif", "image/webp"],
  },
  outputFileTracingIncludes: {
    "/api/admin/invoices/batch": ["assets/fonts/*.ttf", "public/images/logoacik.png"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://images.unsplash.com https://randomuser.me https://*.public.blob.vercel-storage.com https://*.supabase.co https://res.cloudinary.com; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://va.vercel-scripts.com https://res.cloudinary.com https://*.supabase.co; media-src 'self' blob: https://res.cloudinary.com; frame-src 'self' https://www.google.com https://www.google.com.tr;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
