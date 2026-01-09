import { getHaberler, getSiteAyarlari, getStrapiMedia } from '../../lib/strapi';

const SITE_URL = process.env.SITE_URL || 'https://example.com';

function generateRssFeed(haberler, siteAyarlari) {
  const siteName = siteAyarlari?.site_adi || 'Haber Sitesi';
  const siteDescription = siteAyarlari?.default_seo_description || 'Güncel haberler';

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>tr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>Next.js Haber Sitesi</generator>
    ${haberler
      .map((haber) => {
        const imageUrl = getStrapiMedia(haber.kapak_resmi);
        return `
    <item>
      <title>${escapeXml(haber.baslik)}</title>
      <link>${SITE_URL}/haber/${haber.slug}</link>
      <description><![CDATA[${haber.spot || ''}]]></description>
      <pubDate>${new Date(haber.yayin_tarihi).toUTCString()}</pubDate>
      <guid isPermaLink="true">${SITE_URL}/haber/${haber.slug}</guid>
      ${haber.kategori ? `<category>${escapeXml(haber.kategori.isim)}</category>` : ''}
      ${haber.yazar ? `<dc:creator>${escapeXml(haber.yazar.isim)}</dc:creator>` : ''}
      ${imageUrl ? `
      <media:content url="${imageUrl}" medium="image"/>
      <enclosure url="${imageUrl}" type="image/jpeg"/>` : ''}
    </item>`;
      })
      .join('')}
  </channel>
</rss>`;
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
  const [{ data: haberler }, siteAyarlari] = await Promise.all([
    getHaberler({ pageSize: 50 }),
    getSiteAyarlari(),
  ]);

  const rss = generateRssFeed(haberler, siteAyarlari);

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.write(rss);
  res.end();

  return { props: {} };
}

export default function RssFeed() {
  return null;
}
