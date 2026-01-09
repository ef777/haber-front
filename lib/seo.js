import { getStrapiMedia } from './strapi';

const SITE_URL = process.env.SITE_URL || 'https://example.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Haber Sitesi';

// Varsayılan SEO değerleri
export const defaultSEO = {
  title: SITE_NAME,
  description: 'Türkiye ve dünyadan son dakika haberler, güncel gelişmeler',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: SITE_URL,
    siteName: SITE_NAME,
  },
  twitter: {
    handle: '@habersitesi',
    site: '@habersitesi',
    cardType: 'summary_large_image',
  },
};

// Haber detay sayfası için SEO
export function getHaberSEO(haber) {
  const url = `${SITE_URL}/haber/${haber.slug}`;
  const image = getStrapiMedia(haber.kapak_resmi);
  
  return {
    title: haber.seo_title || haber.baslik,
    description: haber.seo_description || haber.spot,
    canonical: url,
    openGraph: {
      type: 'article',
      url,
      title: haber.baslik,
      description: haber.spot,
      images: image ? [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: haber.baslik,
        },
      ] : [],
      article: {
        publishedTime: haber.yayin_tarihi,
        modifiedTime: haber.guncelleme_tarihi || haber.yayin_tarihi,
        section: haber.kategori?.isim,
        authors: [haber.yazar?.isim],
        tags: haber.etiketler?.map(e => e.isim) || [],
      },
    },
    twitter: {
      cardType: 'summary_large_image',
    },
  };
}

// Kategori sayfası için SEO
export function getKategoriSEO(kategori, page = 1) {
  const url = `${SITE_URL}/kategori/${kategori.slug}${page > 1 ? `?page=${page}` : ''}`;
  
  return {
    title: kategori.seo_title || `${kategori.isim} Haberleri`,
    description: kategori.seo_description || `${kategori.isim} kategorisindeki en güncel haberler`,
    canonical: url,
    openGraph: {
      type: 'website',
      url,
      title: `${kategori.isim} Haberleri`,
    },
  };
}

// ==================== JSON-LD STRUCTURED DATA ====================

// WebSite Schema
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/arama?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Organization Schema
export function getOrganizationSchema(siteAyarlari) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: siteAyarlari?.logo ? getStrapiMedia(siteAyarlari.logo) : `${SITE_URL}/logo.png`,
    sameAs: [
      siteAyarlari?.sosyal_medya?.facebook,
      siteAyarlari?.sosyal_medya?.twitter,
      siteAyarlari?.sosyal_medya?.instagram,
      siteAyarlari?.sosyal_medya?.youtube,
    ].filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      email: siteAyarlari?.iletisim_email,
      telephone: siteAyarlari?.iletisim_telefon,
      contactType: 'customer service',
    },
  };
}

// NewsArticle Schema (Google News için kritik)
export function getNewsArticleSchema(haber) {
  const image = getStrapiMedia(haber.kapak_resmi);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/haber/${haber.slug}`,
    },
    headline: haber.baslik,
    description: haber.spot,
    image: image ? [image] : [],
    datePublished: haber.yayin_tarihi,
    dateModified: haber.guncelleme_tarihi || haber.yayin_tarihi,
    author: {
      '@type': 'Person',
      name: haber.yazar?.isim || 'Editör',
      url: haber.yazar ? `${SITE_URL}/yazar/${haber.yazar.slug}` : undefined,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
        width: 600,
        height: 60,
      },
    },
    articleSection: haber.kategori?.isim,
    keywords: haber.news_keywords || haber.etiketler?.map(e => e.isim).join(', '),
    wordCount: haber.icerik?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0,
    isAccessibleForFree: true,
  };
}

// BreadcrumbList Schema
export function getBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${SITE_URL}${item.url}` : undefined,
    })),
  };
}

// ItemList Schema (Haber listesi için)
export function getItemListSchema(haberler, title) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    itemListElement: haberler.map((haber, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/haber/${haber.slug}`,
      name: haber.baslik,
    })),
  };
}

// Person Schema (Yazar sayfası için)
export function getPersonSchema(yazar) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: yazar.isim,
    url: `${SITE_URL}/yazar/${yazar.slug}`,
    image: yazar.foto ? getStrapiMedia(yazar.foto) : undefined,
    description: yazar.biyografi?.replace(/<[^>]*>/g, '').substring(0, 200),
    jobTitle: yazar.unvan,
    sameAs: [
      yazar.sosyal_medya?.twitter,
      yazar.sosyal_medya?.linkedin,
      yazar.sosyal_medya?.instagram,
    ].filter(Boolean),
  };
}

// ==================== GOOGLE NEWS META TAGS ====================

export function getGoogleNewsMeta(haber) {
  return {
    'news_keywords': haber.news_keywords || haber.etiketler?.map(e => e.isim).join(', '),
    'original-source': `${SITE_URL}/haber/${haber.slug}`,
    'syndication-source': `${SITE_URL}/haber/${haber.slug}`,
  };
}

// ==================== AMP LINK ====================

export function getAmpUrl(slug) {
  return `${SITE_URL}/haber/${slug}/amp`;
}

// ==================== CANONICAL & ALTERNATE ====================

export function getAlternateLinks(slug, hasAmp = true) {
  const links = [
    { rel: 'canonical', href: `${SITE_URL}/haber/${slug}` },
  ];
  
  if (hasAmp) {
    links.push({ rel: 'amphtml', href: `${SITE_URL}/haber/${slug}/amp` });
  }
  
  return links;
}
