/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Resim optimizasyonu
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**.strapi.io', // Strapi Cloud kullanırsan
      },
      {
        protocol: 'https',
        hostname: 'your-strapi-domain.com', // Kendi domain'in
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Trailing slash (SEO için tutarlılık)
  trailingSlash: false,

  // Compression
  compress: true,

  // Headers (Cache, Security)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
      {
        // Statik dosyalar için uzun cache
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      // Eski URL yapısından yeni yapıya (varsa)
      // {
      //   source: '/haberler/:slug',
      //   destination: '/haber/:slug',
      //   permanent: true,
      // },
    ];
  },

  // Rewrites (API proxy)
  async rewrites() {
    return [
      // Strapi API proxy (CORS sorunlarını önler)
      {
        source: '/api/strapi/:path*',
        destination: `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/:path*`,
      },
    ];
  },

  // Environment variables
  env: {
    SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
    STRAPI_URL: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
  },

  // Webpack config (gerekirse)
  webpack: (config, { isServer }) => {
    // SVG loader örneği
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

module.exports = nextConfig;
