import Head from 'next/head';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getHaberBySlug, getAllHaberSlugs, getSiteAyarlari, getStrapiMedia } from '../../../lib/strapi';
import { getNewsArticleSchema } from '../../../lib/seo';

const SITE_URL = process.env.SITE_URL || 'https://example.com';

// AMP sayfası olarak işaretle
export const config = { amp: true };

export default function HaberAMP({ haber, siteAyarlari }) {
  if (!haber) return <div>Haber bulunamadı</div>;

  const kapakResmi = getStrapiMedia(haber.kapak_resmi);
  const formattedDate = haber.yayin_tarihi
    ? format(new Date(haber.yayin_tarihi), 'd MMMM yyyy, HH:mm', { locale: tr })
    : '';

  // HTML içeriğinden img taglarını amp-img'e çevir
  const ampContent = haber.icerik
    ?.replace(/<img([^>]*)src="([^"]*)"([^>]*)>/gi, (match, before, src, after) => {
      const fullSrc = src.startsWith('http') ? src : `${process.env.NEXT_PUBLIC_STRAPI_URL}${src}`;
      return `<amp-img${before}src="${fullSrc}"${after} layout="responsive" width="800" height="450"></amp-img>`;
    })
    .replace(/<iframe([^>]*)>/gi, '<amp-iframe$1 layout="responsive" sandbox="allow-scripts allow-same-origin">')
    .replace(/<\/iframe>/gi, '</amp-iframe>');

  return (
    <html amp="" lang="tr">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
        
        <title>{haber.baslik} - {siteAyarlari?.site_adi}</title>
        <meta name="description" content={haber.spot} />
        
        {/* Canonical - normal sayfaya işaret et */}
        <link rel="canonical" href={`${SITE_URL}/haber/${haber.slug}`} />
        
        {/* AMP Boilerplate */}
        <style amp-boilerplate="">{`body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`}</style>
        <noscript>
          <style amp-boilerplate="">{`body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`}</style>
        </noscript>
        
        {/* AMP Script */}
        <script async src="https://cdn.ampproject.org/v0.js"></script>
        <script async custom-element="amp-social-share" src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js"></script>
        <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={haber.baslik} />
        <meta property="og:description" content={haber.spot} />
        {kapakResmi && <meta property="og:image" content={kapakResmi} />}
        
        {/* Google News */}
        <meta name="news_keywords" content={haber.news_keywords} />
        <meta name="author" content={haber.yazar?.isim} />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getNewsArticleSchema(haber)) }}
        />
        
        {/* AMP Custom CSS */}
        <style amp-custom="">{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 16px;
          }
          
          header {
            border-bottom: 1px solid #eee;
            padding-bottom: 16px;
            margin-bottom: 16px;
          }
          
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #dc2626;
            text-decoration: none;
          }
          
          .kategori {
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            margin-bottom: 12px;
          }
          
          h1 {
            font-size: 28px;
            line-height: 1.3;
            margin: 0 0 16px 0;
          }
          
          .spot {
            font-size: 18px;
            color: #666;
            margin-bottom: 16px;
          }
          
          .meta {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            font-size: 14px;
            color: #888;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid #eee;
          }
          
          .kapak-resmi {
            margin-bottom: 20px;
          }
          
          .icerik {
            font-size: 18px;
            line-height: 1.8;
          }
          
          .icerik p {
            margin-bottom: 16px;
          }
          
          .icerik h2, .icerik h3 {
            margin-top: 24px;
            margin-bottom: 12px;
          }
          
          .share-buttons {
            display: flex;
            gap: 8px;
            margin: 20px 0;
          }
          
          .etiketler {
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #eee;
          }
          
          .etiket {
            display: inline-block;
            background: #f3f4f6;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            margin: 4px;
            color: #374151;
            text-decoration: none;
          }
          
          footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 14px;
            color: #888;
          }
          
          footer a {
            color: #dc2626;
            text-decoration: none;
          }
        `}</style>
      </Head>
      
      <body>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <amp-analytics type="gtag" data-credentials="include">
            <script type="application/json" dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                vars: {
                  gtag_id: process.env.NEXT_PUBLIC_GA_ID,
                  config: {
                    [process.env.NEXT_PUBLIC_GA_ID]: { groups: 'default' }
                  }
                }
              })
            }} />
          </amp-analytics>
        )}

        <header>
          <a href="/" className="logo">{siteAyarlari?.site_adi || 'Haber Sitesi'}</a>
        </header>

        <article>
          {/* Kategori */}
          {haber.kategori && (
            <a href={`/kategori/${haber.kategori.slug}`} className="kategori">
              {haber.kategori.isim}
            </a>
          )}

          {/* Başlık */}
          <h1>{haber.baslik}</h1>

          {/* Spot */}
          <p className="spot">{haber.spot}</p>

          {/* Meta */}
          <div className="meta">
            {haber.yazar && <span>{haber.yazar.isim}</span>}
            <time dateTime={haber.yayin_tarihi}>{formattedDate}</time>
          </div>

          {/* Kapak Resmi */}
          {kapakResmi && (
            <amp-img
              className="kapak-resmi"
              src={kapakResmi}
              alt={haber.baslik}
              width="800"
              height="450"
              layout="responsive"
            />
          )}

          {/* Paylaş */}
          <div className="share-buttons">
            <amp-social-share type="twitter" width="40" height="40" />
            <amp-social-share type="facebook" width="40" height="40" data-param-app_id="YOUR_FB_APP_ID" />
            <amp-social-share type="whatsapp" width="40" height="40" />
            <amp-social-share type="linkedin" width="40" height="40" />
          </div>

          {/* İçerik */}
          <div className="icerik" dangerouslySetInnerHTML={{ __html: ampContent }} />

          {/* Etiketler */}
          {haber.etiketler?.length > 0 && (
            <div className="etiketler">
              {haber.etiketler.map((etiket) => (
                <a key={etiket.id} href={`/etiket/${etiket.slug}`} className="etiket">
                  #{etiket.isim}
                </a>
              ))}
            </div>
          )}
        </article>

        <footer>
          <p>
            <a href={`/haber/${haber.slug}`}>Normal sayfayı görüntüle</a> | 
            <a href="/"> Ana Sayfa</a>
          </p>
          <p>© {new Date().getFullYear()} {siteAyarlari?.site_adi}</p>
        </footer>
      </body>
    </html>
  );
}

export async function getStaticPaths() {
  const haberler = await getAllHaberSlugs();
  return {
    paths: haberler.map((h) => ({ params: { slug: h.slug } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const [haber, siteAyarlari] = await Promise.all([
    getHaberBySlug(params.slug),
    getSiteAyarlari(),
  ]);

  if (!haber) return { notFound: true };

  return {
    props: { haber, siteAyarlari },
    revalidate: 60,
  };
}
