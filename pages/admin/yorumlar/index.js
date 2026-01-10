import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { AdminAuthProvider, useAdminAuth } from '../../../contexts/AdminAuthContext';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function YorumlarContent() {
  const { getToken } = useAdminAuth();
  const [yorumlar, setYorumlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [durum, setDurum] = useState('beklemede');

  useEffect(() => {
    fetchYorumlar();
  }, [durum]);

  async function fetchYorumlar() {
    setLoading(true);
    const token = getToken();

    try {
      const response = await fetch(
        `${STRAPI_URL}/api/yorumlar?filters[durum][$eq]=${durum}&sort=createdAt:desc&populate=haber,kullanici`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setYorumlar(data.data || []);
    } catch (error) {
      console.error('Yorumlar yuklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    const token = getToken();

    try {
      await fetch(`${STRAPI_URL}/api/yorumlar/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { durum: newStatus } }),
      });
      fetchYorumlar();
    } catch (error) {
      console.error('Durum guncellenemedi:', error);
      alert('Islem basarisiz oldu');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Bu yorumu silmek istediginizden emin misiniz?')) return;

    const token = getToken();

    try {
      await fetch(`${STRAPI_URL}/api/yorumlar/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchYorumlar();
    } catch (error) {
      console.error('Yorum silinemedi:', error);
      alert('Silme islemi basarisiz oldu');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Yorum Yonetimi</h2>
        <p className="text-gray-500 dark:text-gray-400">Yorumlari onaylayin veya reddedin</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { value: 'beklemede', label: 'Beklemede', color: 'yellow' },
          { value: 'onaylandi', label: 'Onaylandi', color: 'green' },
          { value: 'reddedildi', label: 'Reddedildi', color: 'red' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setDurum(tab.value)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              durum === tab.value
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Yorum listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : yorumlar.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Bu kategoride yorum bulunmuyor
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {yorumlar.map((yorum) => {
              const attrs = yorum.attributes || yorum;
              const haberBaslik = attrs.haber?.data?.attributes?.baslik || 'Bilinmeyen Haber';
              const authorName = attrs.kullanici?.data?.attributes?.username || attrs.misafir_adi || 'Anonim';
              const authorEmail = attrs.kullanici?.data?.attributes?.email || attrs.misafir_email || '';

              return (
                <div key={yorum.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Yazar bilgisi */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <span className="text-primary-600 font-bold text-sm">
                            {authorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {authorName}
                          </p>
                          <p className="text-xs text-gray-500">{authorEmail}</p>
                        </div>
                      </div>

                      {/* Yorum icerigi */}
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {attrs.icerik}
                      </p>

                      {/* Meta bilgiler */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Haber: {haberBaslik}</span>
                        <span>{new Date(attrs.createdAt).toLocaleString('tr-TR')}</span>
                      </div>
                    </div>

                    {/* Aksiyonlar */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {durum === 'beklemede' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(yorum.id, 'onaylandi')}
                            className="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => handleStatusChange(yorum.id, 'reddedildi')}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            Reddet
                          </button>
                        </>
                      )}
                      {durum === 'onaylandi' && (
                        <button
                          onClick={() => handleStatusChange(yorum.id, 'reddedildi')}
                          className="px-3 py-1.5 text-sm font-medium text-yellow-600 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 rounded-lg"
                        >
                          Gizle
                        </button>
                      )}
                      {durum === 'reddedildi' && (
                        <button
                          onClick={() => handleStatusChange(yorum.id, 'onaylandi')}
                          className="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 rounded-lg"
                        >
                          Onayla
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(yorum.id)}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function YorumlarPage() {
  return (
    <AdminAuthProvider>
      <AdminLayout title="Yorumlar">
        <YorumlarContent />
      </AdminLayout>
    </AdminAuthProvider>
  );
}
