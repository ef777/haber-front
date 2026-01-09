import Head from 'next/head';
import Layout from '../components/Layout';
import HaberCard from '../components/HaberCard';
import MansetSlider from '../components/MansetSlider';
import SonDakikaBanner from '../components/SonDakikaBanner';
import Sidebar from '../components/Sidebar';
import {
  getMansetHaberler,
  getSonDakikaHaberler,
  getHaberler,
  getKategoriler,
  getSiteAyarlari,
} from '../lib/strapi';
import { getWebSiteSchema, getOrganizationSchema } from '../lib/seo';

export default function Home({ mansetHaberler, sonDakikaHaberler, sonHaberler, kategoriler, siteAyarlari }) {
  const siteName = siteAyarlari?.site_adi || 'Haber Sitesi';

  return (
    <Layout kategoriler={kategoriler} siteAyarlari={siteAyarlari}>
      <Head>
        <title>{siteName} - {siteAyarlari?.site_slogan || 'Güncel Haberler'}</title>
        <meta name="description" content={siteAyarlari?.default_seo_description} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={siteName} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebSiteSchema()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationSchema(siteAyarlari)) }} />
      </Head>

      {sonDakikaHaberler.length > 0 && <SonDakikaBanner haberler={sonDakikaHaberler} />}

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {mansetHaberler.length > 0 && (
              <section className="mb-8">
                <MansetSlider haberler={mansetHaberler} />
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold mb-4 border-b-2 border-red-600 pb-2">Son Haberler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sonHaberler.map((haber) => (
                  <HaberCard key={haber.id} haber={haber} />
                ))}
              </div>
            </section>
          </div>
          <aside className="lg:col-span-1">
            <Sidebar kategoriler={kategoriler} />
          </aside>
        </div>
      </main>
    </Layout>
  );
}

export async function getStaticProps() {
  const [mansetHaberler, sonDakikaHaberler, { data: sonHaberler }, kategoriler, siteAyarlari] = await Promise.all([
    getMansetHaberler(5),
    getSonDakikaHaberler(5),
    getHaberler({ pageSize: 12 }),
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
