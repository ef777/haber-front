import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { AdminAuthProvider, useAdminAuth } from '../../../contexts/AdminAuthContext';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function AyarlarContent() {
  const { getToken } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('site');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [siteAyarlari, setSiteAyarlari] = useState({
    site_adi: '',
    site_aciklamasi: '',
    iletisim_email: '',
    footer_text: '',
  });

  const [temaAyarlari, setTemaAyarlari] = useState({
    varsayilan_tema: 'system',
    ana_renk: '#dc2626',
    ikincil_renk: '#1f2937',
    vurgu_renk: '#f59e0b',
    baslik_fontu: 'Merriweather',
    govde_fontu: 'Inter',
    font_size_base: 16,
    layout_style: 'classic_newspaper',
  });

  useEffect(() => {
    fetchAyarlar();
  }, []);

  async function fetchAyarlar() {
    setLoading(true);
    const token = getToken();

    try {
      const [siteRes, temaRes] = await Promise.all([
        fetch(`${STRAPI_URL}/api/site-ayarlari?populate=*`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${STRAPI_URL}/api/tema-ayarlari?populate=*`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const siteData = await siteRes.json();
      const temaData = await temaRes.json();

      if (siteData.data) {
        const attrs = siteData.data.attributes || siteData.data;
        setSiteAyarlari({
          site_adi: attrs.site_adi || '',
          site_aciklamasi: attrs.site_aciklamasi || '',
          iletisim_email: attrs.iletisim_email || '',
          footer_text: attrs.footer_text || '',
        });
      }

      if (temaData.data) {
        const attrs = temaData.data.attributes || temaData.data;
        setTemaAyarlari({
          varsayilan_tema: attrs.varsayilan_tema || 'system',
          ana_renk: attrs.ana_renk || '#dc2626',
          ikincil_renk: attrs.ikincil_renk || '#1f2937',
          vurgu_renk: attrs.vurgu_renk || '#f59e0b',
          baslik_fontu: attrs.baslik_fontu || 'Merriweather',
          govde_fontu: attrs.govde_fontu || 'Inter',
          font_size_base: attrs.font_size_base || 16,
          layout_style: attrs.layout_style || 'classic_newspaper',
        });
      }
    } catch (error) {
      console.error('Ayarlar yuklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSite(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const token = getToken();

    try {
      await fetch(`${STRAPI_URL}/api/site-ayarlari`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: siteAyarlari }),
      });
      setMessage({ type: 'success', text: 'Site ayarlari kaydedildi' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Kaydetme basarisiz oldu' });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveTema(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const token = getToken();

    try {
      await fetch(`${STRAPI_URL}/api/tema-ayarlari`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: temaAyarlari }),
      });
      setMessage({ type: 'success', text: 'Tema ayarlari kaydedildi' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Kaydetme basarisiz oldu' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ayarlar</h2>
        <p className="text-gray-500 dark:text-gray-400">Site ve tema ayarlarini yonetin</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('site')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'site'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Site Ayarlari
        </button>
        <button
          onClick={() => setActiveTab('tema')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'tema'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Tema Ayarlari
        </button>
      </div>

      {/* Site Ayarlari */}
      {activeTab === 'site' && (
        <form onSubmit={handleSaveSite} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Site Adi</label>
              <input
                type="text"
                value={siteAyarlari.site_adi}
                onChange={(e) => setSiteAyarlari(p => ({ ...p, site_adi: e.target.value }))}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Iletisim E-posta</label>
              <input
                type="email"
                value={siteAyarlari.iletisim_email}
                onChange={(e) => setSiteAyarlari(p => ({ ...p, iletisim_email: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Site Aciklamasi</label>
            <textarea
              value={siteAyarlari.site_aciklamasi}
              onChange={(e) => setSiteAyarlari(p => ({ ...p, site_aciklamasi: e.target.value }))}
              className="form-input"
              rows={3}
            />
          </div>
          <div>
            <label className="form-label">Footer Metni</label>
            <textarea
              value={siteAyarlari.footer_text}
              onChange={(e) => setSiteAyarlari(p => ({ ...p, footer_text: e.target.value }))}
              className="form-input"
              rows={2}
            />
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      )}

      {/* Tema Ayarlari */}
      {activeTab === 'tema' && (
        <form onSubmit={handleSaveTema} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="form-label">Varsayilan Tema</label>
              <select
                value={temaAyarlari.varsayilan_tema}
                onChange={(e) => setTemaAyarlari(p => ({ ...p, varsayilan_tema: e.target.value }))}
                className="form-input"
              >
                <option value="system">Sistem</option>
                <option value="light">Acik</option>
                <option value="dark">Koyu</option>
              </select>
            </div>
            <div>
              <label className="form-label">Layout Stili</label>
              <select
                value={temaAyarlari.layout_style}
                onChange={(e) => setTemaAyarlari(p => ({ ...p, layout_style: e.target.value }))}
                className="form-input"
              >
                <option value="classic_newspaper">Klasik Gazete</option>
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div>
              <label className="form-label">Font Boyutu (px)</label>
              <input
                type="number"
                min="12"
                max="20"
                value={temaAyarlari.font_size_base}
                onChange={(e) => setTemaAyarlari(p => ({ ...p, font_size_base: parseInt(e.target.value) }))}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="form-label">Ana Renk</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={temaAyarlari.ana_renk}
                  onChange={(e) => setTemaAyarlari(p => ({ ...p, ana_renk: e.target.value }))}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={temaAyarlari.ana_renk}
                  onChange={(e) => setTemaAyarlari(p => ({ ...p, ana_renk: e.target.value }))}
                  className="form-input flex-1"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Ikincil Renk</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={temaAyarlari.ikincil_renk}
                  onChange={(e) => setTemaAyarlari(p => ({ ...p, ikincil_renk: e.target.value }))}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={temaAyarlari.ikincil_renk}
                  onChange={(e) => setTemaAyarlari(p => ({ ...p, ikincil_renk: e.target.value }))}
                  className="form-input flex-1"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Vurgu Renk</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={temaAyarlari.vurgu_renk}
                  onChange={(e) => setTemaAyarlari(p => ({ ...p, vurgu_renk: e.target.value }))}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={temaAyarlari.vurgu_renk}
                  onChange={(e) => setTemaAyarlari(p => ({ ...p, vurgu_renk: e.target.value }))}
                  className="form-input flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Baslik Fontu</label>
              <select
                value={temaAyarlari.baslik_fontu}
                onChange={(e) => setTemaAyarlari(p => ({ ...p, baslik_fontu: e.target.value }))}
                className="form-input"
              >
                <option value="Merriweather">Merriweather</option>
                <option value="Georgia">Georgia</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Roboto Slab">Roboto Slab</option>
                <option value="Lora">Lora</option>
                <option value="PT Serif">PT Serif</option>
              </select>
            </div>
            <div>
              <label className="form-label">Govde Fontu</label>
              <select
                value={temaAyarlari.govde_fontu}
                onChange={(e) => setTemaAyarlari(p => ({ ...p, govde_fontu: e.target.value }))}
                className="form-input"
              >
                <option value="Inter">Inter</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Roboto">Roboto</option>
                <option value="Lato">Lato</option>
                <option value="Noto Sans">Noto Sans</option>
                <option value="PT Sans">PT Sans</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Kaydediliyor...' : 'Tema Ayarlarini Kaydet'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AyarlarPage() {
  return (
    <AdminAuthProvider>
      <AdminLayout title="Ayarlar">
        <AyarlarContent />
      </AdminLayout>
    </AdminAuthProvider>
  );
}
