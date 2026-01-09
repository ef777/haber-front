import { getNewsHaberler, getSiteAyarlari } from '../lib/strapi';

const SITE_URL = process.env.SITE_URL || 'https://example.com';

function generateNewsSitemap(haberler, siteName) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${haberler
  .map((haber) => {
    const imageTag = haber.kapak_resmi?.url
      ? `
    <image:image>
      <image:loc>${haber.kapak_resmi.url.startsWith('http') ? haber.kapak_resmi.url : `${process.env.NEXT_PUBLIC_STRAPI_URL}${haber.kapak_resmi.url}`}</image:loc>
      <image:title>${escapeXml(haber.baslik)}</image:title>
    </image:image>`
      : '';

    return `  <url>
    <loc>${SITE_URL}/haber/${haber.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteName)}</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${haber.yayin_tarihi}</news:publication_date>
      <news:title>${escapeXml(haber.baslik)}</news:title>
      ${haber.news_keywords ? `<news:keywords>${escapeXml(haber.news_keywords)}</news:keywords>` : ''}
    </news:news>${imageTag}
  </url>`;
  })
  .join('\n')}
</urlset>`;
}

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function getServerSideProps({ res }) {
  const [haberler, siteAyarlari] = await Promise.all([
    getNewsHaberler(),
    getSiteAyarlari(),
  ]);

  const siteName = siteAyarlari?.site_adi || 'Haber Sitesi';
  const sitemap = generateNewsSitemap(haberler, siteName);

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300'); // 5 dk cache
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function NewsSitemap() {
  return null;
}
