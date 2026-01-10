import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '../../../components/admin/AdminLayout';
import { AdminAuthProvider, useAdminAuth } from '../../../contexts/AdminAuthContext';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function HaberlerContent() {
  const { getToken } = useAdminAuth();
  const [haberler, setHaberler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [durum, setDurum] = useState('');

  useEffect(() => {
    fetchHaberler();
  }, [page, durum]);

  async function fetchHaberler() {
    setLoading(true);
    const token = getToken();

    let url = `${STRAPI_URL}/api/haberler?sort=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=10&populate=kapak_resmi,kategori`;

    if (durum) {
      url += `&filters[durum][$eq]=${durum}`;
    }
    if (search) {
      url += `&filters[baslik][$containsi]=${search}`;
    }

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setHaberler(data.data || []);
      setTotalPages(data.meta?.pagination?.pageCount || 1);
    } catch (error) {
      console.error('Haberler yuklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Bu haberi silmek istediginizden emin misiniz?')) return;

    const token = getToken();
    try {
      await fetch(`${STRAPI_URL}/api/haberler/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHaberler();
    } catch (error) {
      console.error('Haber silinemedi:', error);
      alert('Haber silinirken bir hata olustu');
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchHaberler();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Haberler</h2>
          <p className="text-gray-500 dark:text-gray-400">Tum haberleri yonetin</p>
        </div>
        <Link href="/admin/haberler/yeni" className="btn btn-primary">
          + Yeni Haber Ekle
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Haber ara..."
            className="form-input flex-1"
          />
          <select
            value={durum}
            onChange={(e) => { setDurum(e.target.value); setPage(1); }}
            className="form-input sm:w-40"
          >
            <option value="">Tum Durumlar</option>
            <option value="yayinda">Yayinda</option>
            <option value="taslak">Taslak</option>
            <option value="arsiv">Arsiv</option>
          </select>
          <button type="submit" className="btn btn-secondary">
            Ara
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : haberler.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Haber bulunamadi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Haber
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Islemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {haberler.map((haber) => {
                  const attrs = haber.attributes || haber;
                  const kapakUrl = attrs.kapak_resmi?.data?.attributes?.url;

                  return (
                    <tr key={haber.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {kapakUrl && (
                            <Image
                              src={kapakUrl.startsWith('http') ? kapakUrl : `${STRAPI_URL}${kapakUrl}`}
                              alt={attrs.baslik}
                              width={64}
                              height={48}
                              className="rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                              {attrs.baslik}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {attrs.ozet}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {attrs.kategori?.data?.attributes?.isim || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          attrs.durum === 'yayinda'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : attrs.durum === 'arsiv'
                            ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {attrs.durum === 'yayinda' ? 'Yayinda' : attrs.durum === 'arsiv' ? 'Arsiv' : 'Taslak'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(attrs.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/haberler/${haber.id}`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Duzenle
                          </Link>
                          <button
                            onClick={() => handleDelete(haber.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sayfa {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Onceki
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary disabled:opacity-50"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HaberlerPage() {
  return (
    <AdminAuthProvider>
      <AdminLayout title="Haberler">
        <HaberlerContent />
      </AdminLayout>
    </AdminAuthProvider>
  );
}
