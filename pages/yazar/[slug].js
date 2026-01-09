import Head from 'next/head';
import Image from 'next/image';
import Layout from '../../components/Layout';
import HaberCard from '../../components/HaberCard';
import {
  getHaberler,
  getYazarlar,
  getYazarBySlug,
  getKategoriler,
  getSiteAyarlari,
  getStrapiMedia,
} from '../../lib/strapi';
import { getPersonSchema } from '../../lib/seo';

const SITE_URL = process.env.SITE_URL || 'https://example.com';

export default function YazarSayfasi({ yazar, haberler, kategoriler, siteAyarlari }) {
  if (!yazar) {
    return <div className="text-center py-20">Yazar bulunamadı</div>;
  }

  const foto = getStrapiMedia(yazar.foto);

  return (
    <Layout kategoriler={kategoriler} siteAyarlari={siteAyarlari}>
      <Head>
        <title>{yazar.isim} - {siteAyarlari?.site_adi}</title>
        <meta name="description" content={`${yazar.isim} tarafından yazılan haberler`} />
        <link rel="canonical" href={`${SITE_URL}/yazar/${yazar.slug}`} />
        
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={yazar.isim} />
        {foto && <meta property="og:image" content={foto} />}
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getPersonSchema(yazar)) }}
        />
      </Head>

      <main className="container mx-auto px-4 py-6">
        {/* Yazar Profili */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {foto && (
              <Image
                src={foto}
                alt={yazar.isim}
                width={150}
                height={150}
                className="rounded-full"
              />
            )}
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{yazar.isim}</h1>
              {yazar.unvan && (
                <p className="text-red-600 font-medium mt-1">{yazar.unvan}</p>
              )}
              {yazar.biyografi && (
                <div
                  className="text-gray-600 mt-4 prose"
                  dangerouslySetInnerHTML={{ __html: yazar.biyografi }}
                />
              )}
              
              {/* Sosyal Medya */}
              {yazar.sosyal_medya && (
                <div className="flex gap-3 mt-4 justify-center md:justify-start">
                  {yazar.sosyal_medya.twitter && (
                    <a href={yazar.sosyal_medya.twitter} target="_blank" rel="noopener noreferrer"
                       className="text-sky-500 hover:text-sky-600">Twitter</a>
                  )}
                  {yazar.sosyal_medya.instagram && (
                    <a href={yazar.sosyal_medya.instagram} target="_blank" rel="noopener noreferrer"
                       className="text-pink-500 hover:text-pink-600">Instagram</a>
                  )}
                  {yazar.sosyal_medya.linkedin && (
                    <a href={yazar.sosyal_medya.linkedin} target="_blank" rel="noopener noreferrer"
                       className="text-blue-600 hover:text-blue-700">LinkedIn</a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Yazarın Haberleri */}
        <h2 className="text-2xl font-bold mb-6 border-b-2 border-red-600 pb-2">
          {yazar.isim} Yazıları
        </h2>
        
        {haberler.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {haberler.map((haber) => (
              <HaberCard key={haber.id} haber={haber} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">Henüz haber yok.</p>
        )}
      </main>
    </Layout>
  );
}

export async function getStaticPaths() {
  const yazarlar = await getYazarlar();
  
  return {
    paths: yazarlar.map((y) => ({ params: { slug: y.slug } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const [yazar, kategoriler, siteAyarlari] = await Promise.all([
    getYazarBySlug(params.slug),
    getKategoriler(),
    getSiteAyarlari(),
  ]);

  if (!yazar) {
    return { notFound: true };
  }

  const { data: haberler } = await getHaberler({
    yazar: params.slug,
    pageSize: 20,
  });

  return {
    props: {
      yazar,
      haberler: haberler || [],
      kategoriler: kategoriler || [],
      siteAyarlari: siteAyarlari || null,
    },
    revalidate: 60,
  };
}
