import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import HaberCard from '../../components/HaberCard';
import Sidebar from '../../components/Sidebar';
import {
  getHaberler,
  getKategoriler,
  getKategoriBySlug,
  getSiteAyarlari,
} from '../../lib/strapi';

const SITE_URL = process.env.SITE_URL || 'https://example.com';

export default function KategoriSayfasi({ kategori, haberler, pagination, kategoriler, siteAyarlari }) {
  const router = useRouter();
  const currentPage = parseInt(router.query.page) || 1;

  if (router.isFallback) {
    return <div className="text-center py-20">Yükleniyor...</div>;
  }

  if (!kategori) {
    return <div className="text-center py-20">Kategori bulunamadı</div>;
  }

  return (
    <Layout kategoriler={kategoriler} siteAyarlari={siteAyarlari}>
      <Head>
        <title>{kategori.seo_title || `${kategori.isim} Haberleri`} - {siteAyarlari?.site_adi}</title>
        <meta name="description" content={kategori.seo_description || `${kategori.isim} kategorisindeki en güncel haberler`} />
        <link rel="canonical" href={`${SITE_URL}/kategori/${kategori.slug}${currentPage > 1 ? `?page=${currentPage}` : ''}`} />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${kategori.isim} Haberleri`} />
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="container mx-auto px-4 py-6">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span
              className="w-4 h-4 rounded"
              style={{ backgroundColor: kategori.renk || '#dc2626' }}
            />
            {kategori.isim} Haberleri
          </h1>
          {kategori.aciklama && (
            <p className="text-gray-600 mt-2">{kategori.aciklama}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {haberler.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {haberler.map((haber) => (
                    <HaberCard key={haber.id} haber={haber} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pageCount > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {currentPage > 1 && (
                      <a
                        href={`/kategori/${kategori.slug}?page=${currentPage - 1}`}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Önceki
                      </a>
                    )}
                    
                    <span className="px-4 py-2 bg-red-600 text-white rounded">
                      {currentPage} / {pagination.pageCount}
                    </span>
                    
                    {currentPage < pagination.pageCount && (
                      <a
                        href={`/kategori/${kategori.slug}?page=${currentPage + 1}`}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Sonraki
                      </a>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center py-12">Bu kategoride henüz haber yok.</p>
            )}
          </div>

          <aside className="lg:col-span-1">
            <Sidebar kategoriler={kategoriler} />
          </aside>
        </div>
      </main>
    </Layout>
  );
}

export async function getStaticPaths() {
  const kategoriler = await getKategoriler();
  
  return {
    paths: kategoriler.map((k) => ({ params: { slug: k.slug } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const [kategori, kategoriler, siteAyarlari] = await Promise.all([
    getKategoriBySlug(params.slug),
    getKategoriler(),
    getSiteAyarlari(),
  ]);

  if (!kategori) {
    return { notFound: true };
  }

  const { data: haberler, pagination } = await getHaberler({
    kategori: params.slug,
    pageSize: 12,
  });

  return {
    props: {
      kategori,
      haberler: haberler || [],
      pagination: pagination || null,
      kategoriler: kategoriler || [],
      siteAyarlari: siteAyarlari || null,
    },
    revalidate: 60,
  };
}
