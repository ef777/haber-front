import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import HaberCard from '../components/HaberCard';
import Sidebar from '../components/Sidebar';
import { getHaberler, getKategoriler, getSiteAyarlari } from '../lib/strapi';

export default function AramaSayfasi({ kategoriler, siteAyarlari }) {
  const router = useRouter();
  const { q } = router.query;
  
  const [haberler, setHaberler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (q) {
      setSearchTerm(q);
      aramaYap(q);
    }
  }, [q]);

  const aramaYap = async (term) => {
    if (!term || term.length < 2) return;
    
    setLoading(true);
    try {
      const { data } = await getHaberler({ search: term, pageSize: 20 });
      setHaberler(data || []);
    } catch (error) {
      console.error('Arama hatası:', error);
      setHaberler([]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/arama?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <Layout kategoriler={kategoriler} siteAyarlari={siteAyarlari}>
      <Head>
        <title>{q ? `"${q}" için arama sonuçları` : 'Arama'} - {siteAyarlari?.site_adi}</title>
        <meta name="robots" content="noindex, follow" />
      </Head>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Arama Formu */}
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="flex gap-2">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Haber ara..."
                  className="flex-1 border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="submit"
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Ara
                </button>
              </div>
            </form>

            {/* Sonuçlar */}
            {q && (
              <h1 className="text-2xl font-bold mb-6">
                "{q}" için arama sonuçları
                {!loading && <span className="text-gray-500 text-lg ml-2">({haberler.length} sonuç)</span>}
              </h1>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Aranıyor...</p>
              </div>
            ) : haberler.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {haberler.map((haber) => (
                  <HaberCard key={haber.id} haber={haber} />
                ))}
              </div>
            ) : q ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl mb-2">Sonuç bulunamadı</p>
                <p>Farklı anahtar kelimeler deneyebilirsiniz.</p>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Aramak istediğiniz kelimeyi yazın.</p>
              </div>
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

export async function getStaticProps() {
  const [kategoriler, siteAyarlari] = await Promise.all([
    getKategoriler(),
    getSiteAyarlari(),
  ]);

  return {
    props: {
      kategoriler: kategoriler || [],
      siteAyarlari: siteAyarlari || null,
    },
    revalidate: 3600,
  };
}
