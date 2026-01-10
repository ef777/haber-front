import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import HaberCard from '../components/HaberCard';
import SonDakikaBanner from '../components/SonDakikaBanner';
import Sidebar from '../components/Sidebar';
import {
  getMansetHaberler,
  getSonDakikaHaberler,
  getHaberler,
  getKategoriler,
  getSiteAyarlari,
  getStrapiMedia,
} from '../lib/strapi';
import { getWebSiteSchema, getOrganizationSchema } from '../lib/seo';

// Ana manset karti
function MainStoryCard({ haber }) {
  const kapakResmi = getStrapiMedia(haber.kapak_resmi);

  return (
    <article className="group">
      <Link href={`/haber/${haber.slug}`} className="block relative aspect-[16/9] mb-4 overflow-hidden rounded-lg">
        {kapakResmi ? (
          <Image
            src={kapakResmi}
            alt={haber.baslik}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
        )}
        {haber.kategori && (
          <span
            className="absolute top-4 left-4 px-3 py-1 text-sm font-bold text-white rounded"
            style={{ backgroundColor: haber.kategori.renk || 'var(--color-primary)' }}
          >
            {haber.kategori.isim}
          </span>
        )}
      </Link>
      <Link href={`/haber/${haber.slug}`}>
        <h2 className="headline-primary group-hover:text-accent transition-colors mb-3">
          {haber.baslik}
        </h2>
      </Link>
      {haber.ozet && (
        <p className="text-secondary-custom text-lg leading-relaxed line-clamp-3">
          {haber.ozet}
        </p>
      )}
      <div className="flex items-center gap-4 mt-4 text-sm text-secondary-custom">
        {haber.yazar && <span>Yazan: {haber.yazar.isim}</span>}
        <span>{new Date(haber.yayin_tarihi).toLocaleDateString('tr-TR')}</span>
      </div>
    </article>
  );
}

// Yan sutun haber karti
function SidebarStoryCard({ haber }) {
  const kapakResmi = getStrapiMedia(haber.kapak_resmi);

  return (
    <article className="group flex gap-4">
      <Link href={`/haber/${haber.slug}`} className="flex-shrink-0 relative w-24 h-24 rounded overflow-hidden">
        {kapakResmi ? (
          <Image
            src={kapakResmi}
            alt={haber.baslik}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
        )}
      </Link>
      <div className="flex-1 min-w-0">
        {haber.kategori && (
          <span className="text-xs font-bold uppercase" style={{ color: haber.kategori.renk || 'var(--color-primary)' }}>
            {haber.kategori.isim}
          </span>
        )}
        <Link href={`/haber/${haber.slug}`}>
          <h3 className="headline-tertiary mt-1 group-hover:text-accent transition-colors line-clamp-2">
            {haber.baslik}
          </h3>
        </Link>
        <span className="text-xs text-secondary-custom mt-1 block">
          {new Date(haber.yayin_tarihi).toLocaleDateString('tr-TR')}
        </span>
      </div>
    </article>
  );
}

// Kompakt haber karti
function CompactNewsCard({ haber, showImage = true }) {
  const kapakResmi = getStrapiMedia(haber.kapak_resmi);

  return (
    <article className="group">
      {showImage && kapakResmi && (
        <Link href={`/haber/${haber.slug}`} className="block relative aspect-video mb-3 rounded overflow-hidden">
          <Image
            src={kapakResmi}
            alt={haber.baslik}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        </Link>
      )}
      {haber.kategori && (
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: haber.kategori.renk || 'var(--color-primary)' }}>
          {haber.kategori.isim}
        </span>
      )}
      <Link href={`/haber/${haber.slug}`}>
        <h3 className="headline-tertiary mt-1 group-hover:text-accent transition-colors line-clamp-2">
          {haber.baslik}
        </h3>
      </Link>
      <p className="text-sm text-secondary-custom line-clamp-2 mt-2">
        {haber.ozet}
      </p>
    </article>
  );
}

// Kategori bolumu
function CategorySection({ kategori, haberler }) {
  const kategoriHaberler = haberler.filter(h => h.kategori?.slug === kategori.slug).slice(0, 4);
  if (kategoriHaberler.length === 0) return null;

  return (
    <section className="section-divider">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold font-heading flex items-center gap-3">
          <span className="w-1 h-6 rounded" style={{ backgroundColor: kategori.renk || 'var(--color-primary)' }}></span>
          {kategori.isim}
        </h2>
        <Link href={`/kategori/${kategori.slug}`} className="text-sm text-accent hover:underline">
          Tumunu Gor &rarr;
        </Link>
      </div>
      <div className="newspaper-four-column">
        {kategoriHaberler.map((haber, index) => (
          <div key={haber.id} className={index < 3 ? 'column-rule' : ''}>
            <CompactNewsCard haber={haber} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home({ mansetHaberler, sonDakikaHaberler, sonHaberler, kategoriler, siteAyarlari }) {
  const siteName = siteAyarlari?.site_adi || 'Haber Sitesi';
  const [mainStory, ...topStories] = mansetHaberler;

  return (
    <Layout kategoriler={kategoriler} siteAyarlari={siteAyarlari}>
      <Head>
        <title>{siteName} - {siteAyarlari?.site_slogan || 'Guncel Haberler'}</title>
        <meta name="description" content={siteAyarlari?.site_aciklamasi || 'Turkiye ve dunyadan en guncel haberler'} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={siteName} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebSiteSchema()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationSchema(siteAyarlari)) }} />
      </Head>

      {/* Son Dakika Banner */}
      {sonDakikaHaberler.length > 0 && <SonDakikaBanner haberler={sonDakikaHaberler} />}

      <main className="container mx-auto px-4 py-8">
        {/* Masthead - Tarih */}
        <div className="masthead mb-8 hidden md:block">
          <p className="masthead-date">
            {new Date().toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Ana Manset Bolgesi */}
        {mainStory && (
          <section className="mb-8">
            <div className="newspaper-grid">
              {/* Ana Haber */}
              <div className="newspaper-main-story">
                <MainStoryCard haber={mainStory} />
              </div>

              {/* Yan Haberler */}
              <div className="newspaper-sidebar-stories space-y-6">
                {topStories.slice(0, 4).map((haber) => (
                  <SidebarStoryCard key={haber.id} haber={haber} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Son Haberler - Dort Sutunlu */}
        <section className="section-divider section-divider-thick">
          <h2 className="text-xl font-bold font-heading uppercase tracking-wide mb-6 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-accent animate-pulse"></span>
            Son Haberler
          </h2>
          <div className="newspaper-four-column">
            {sonHaberler.slice(0, 4).map((haber, index) => (
              <div key={haber.id} className={index < 3 ? 'column-rule' : ''}>
                <CompactNewsCard haber={haber} />
              </div>
            ))}
          </div>
        </section>

        {/* Ikinci Satir - Iki Sutunlu */}
        <section className="section-divider">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sonHaberler.slice(4, 6).map((haber) => (
              <article key={haber.id} className="group">
                <div className="flex gap-4">
                  {getStrapiMedia(haber.kapak_resmi) && (
                    <Link href={`/haber/${haber.slug}`} className="flex-shrink-0 relative w-40 h-28 rounded overflow-hidden">
                      <Image
                        src={getStrapiMedia(haber.kapak_resmi)}
                        alt={haber.baslik}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </Link>
                  )}
                  <div className="flex-1">
                    {haber.kategori && (
                      <span className="text-xs font-bold uppercase" style={{ color: haber.kategori.renk }}>
                        {haber.kategori.isim}
                      </span>
                    )}
                    <Link href={`/haber/${haber.slug}`}>
                      <h3 className="headline-secondary mt-1 group-hover:text-accent transition-colors line-clamp-2">
                        {haber.baslik}
                      </h3>
                    </Link>
                    <p className="text-sm text-secondary-custom mt-2 line-clamp-2">{haber.ozet}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Kategori Bolumleri */}
        {kategoriler.slice(0, 3).map((kategori) => (
          <CategorySection key={kategori.id} kategori={kategori} haberler={sonHaberler} />
        ))}

        {/* Alt Kisim - Grid + Sidebar */}
        <section className="section-divider">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daha fazla haber */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold font-heading mb-6 pb-2 border-b-2 border-accent">
                Diger Haberler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sonHaberler.slice(6, 12).map((haber) => (
                  <HaberCard key={haber.id} haber={haber} size="medium" />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <Sidebar kategoriler={kategoriler} />
            </aside>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export async function getStaticProps() {
  const [mansetHaberler, sonDakikaHaberler, { data: sonHaberler }, kategoriler, siteAyarlari] = await Promise.all([
    getMansetHaberler(5),
    getSonDakikaHaberler(5),
    getHaberler({ pageSize: 20 }),
    getKategoriler(),
    getSiteAyarlari(),
  ]);

  return {
    props: {
      mansetHaberler: mansetHaberler || [],
      sonDakikaHaberler: sonDakikaHaberler || [],
      sonHaberler: sonHaberler || [],
      kategoriler: kategoriler || [],
      siteAyarlari: siteAyarlari || null,
    },
    revalidate: 60,
  };
}
