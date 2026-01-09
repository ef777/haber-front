/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://example.com',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  
  // Sitemap ayarları
  changefreq: 'daily',
  priority: 0.7,
  
  // Hariç tutulacak sayfalar
  exclude: [
    '/admin/*',
    '/api/*',
    '/404',
    '/500',
    '/server-sitemap.xml', // Dinamik sitemap
  ],

  // robots.txt ayarları
  robotsTxtOptions: {
    additionalSitemaps: [
      `${process.env.SITE_URL || 'https://example.com'}/server-sitemap.xml`,
      `${process.env.SITE_URL || 'https://example.com'}/news-sitemap.xml`,
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
      {
        userAgent: 'Googlebot-News',
        allow: '/',
      },
    ],
  },

  // Dinamik sayfalar için transform
  transform: async (config, path) => {
    // Ana sayfa
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'always',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }

    // Haber sayfaları
    if (path.startsWith('/haber/')) {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      };
    }

    // Kategori sayfaları
    if (path.startsWith('/kategori/')) {
      return {
        loc: path,
        changefreq: 'hourly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }

    // Varsayılan
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
