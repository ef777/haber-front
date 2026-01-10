import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminAuthProvider, useAdminAuth } from '../../contexts/AdminAuthContext';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function DashboardContent() {
  const { getToken } = useAdminAuth();
  const [stats, setStats] = useState({
    haberler: 0,
    yorumlar: 0,
    bekleyenYorumlar: 0,
    kategoriler: 0,
  });
  const [sonHaberler, setSonHaberler] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const token = getToken();
      try {
        // Haberleri getir
        const haberlerRes = await fetch(`${STRAPI_URL}/api/haberler?pagination[limit]=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const haberlerData = await haberlerRes.json();

        // Son haberleri getir
        const sonHaberlerRes = await fetch(`${STRAPI_URL}/api/haberler?sort=createdAt:desc&pagination[limit]=5&populate=kategori`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sonHaberlerData = await sonHaberlerRes.json();

        // Kategorileri getir
        const kategorilerRes = await fetch(`${STRAPI_URL}/api/kategoriler?pagination[limit]=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const kategorilerData = await kategorilerRes.json();

        setStats({
          haberler: haberlerData.meta?.pagination?.total || 0,
          kategoriler: kategorilerData.meta?.pagination?.total || 0,
          yorumlar: 0,
          bekleyenYorumlar: 0,
        });

        setSonHaberler(sonHaberlerData.data || []);
      } catch (error) {
        console.error('Dashboard stats error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Haber"
          value={stats.haberler}
          icon={NewspaperIcon}
          color="blue"
          href="/admin/haberler"
        />
        <StatCard
          title="Kategoriler"
          value={stats.kategoriler}
          icon={FolderIcon}
          color="green"
        />
        <StatCard
          title="Toplam Yorum"
          value={stats.yorumlar}
          icon={ChatIcon}
          color="purple"
          href="/admin/yorumlar"
        />
        <StatCard
          title="Bekleyen Yorum"
          value={stats.bekleyenYorumlar}
          icon={ClockIcon}
          color="orange"
          href="/admin/yorumlar?durum=beklemede"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Hizli Islemler
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/haberler/yeni"
            className="btn btn-primary"
          >
            + Yeni Haber Ekle
          </Link>
          <Link
            href="/admin/yorumlar"
            className="btn btn-secondary"
          >
            Yorumlari Yonet
          </Link>
          <Link
            href="/admin/ayarlar"
            className="btn btn-secondary"
          >
            Ayarlar
          </Link>
        </div>
      </div>

      {/* Recent News */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Son Eklenen Haberler
            </h2>
            <Link href="/admin/haberler" className="text-primary-600 text-sm hover:underline">
              Tumunu Gor &rarr;
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sonHaberler.length === 0 ? (
            <p className="p-6 text-gray-500 dark:text-gray-400 text-center">
              Henuz haber eklenmemis
            </p>
          ) : (
            sonHaberler.map((haber) => (
              <div key={haber.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {haber.attributes?.baslik || haber.baslik}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {haber.attributes?.kategori?.data?.attributes?.isim || 'Kategori yok'}
                      {' • '}
                      {new Date(haber.attributes?.createdAt || haber.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (haber.attributes?.durum || haber.durum) === 'yayinda'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {(haber.attributes?.durum || haber.durum) === 'yayinda' ? 'Yayinda' : 'Taslak'}
                    </span>
                    <Link
                      href={`/admin/haberler/${haber.id}`}
                      className="text-primary-600 text-sm hover:underline"
                    >
                      Duzenle
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, href }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  };

  const content = (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

// Icons
function NewspaperIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}

function FolderIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function ChatIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function AdminDashboard() {
  return (
    <AdminAuthProvider>
      <AdminLayout title="Yonetim Paneli">
        <DashboardContent />
      </AdminLayout>
    </AdminAuthProvider>
  );
}
