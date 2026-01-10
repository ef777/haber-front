import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/admin/AdminLayout';
import { AdminAuthProvider, useAdminAuth } from '../../../contexts/AdminAuthContext';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function HaberDuzenleContent() {
  const { getToken } = useAdminAuth();
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    baslik: '',
    slug: '',
    ozet: '',
    icerik: '',
    kategori: '',
    yazar: '',
    yayin_tarihi: '',
    durum: 'taslak',
    manset: false,
    sondakika: false,
  });

  const [kategoriler, setKategoriler] = useState([]);
  const [yazarlar, setYazarlar] = useState([]);
  const [kapakResmi, setKapakResmi] = useState(null);
  const [kapakPreview, setKapakPreview] = useState(null);
  const [mevcutKapak, setMevcutKapak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Haberi ve kategorileri yukle
  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      const token = getToken();
      try {
        const [haberRes, katRes, yazRes] = await Promise.all([
          fetch(`${STRAPI_URL}/api/haberler/${id}?populate=*`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${STRAPI_URL}/api/kategoriler?filters[aktif][$eq]=true`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${STRAPI_URL}/api/yazarlar?filters[aktif][$eq]=true`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const haberData = await haberRes.json();
        const katData = await katRes.json();
        const yazData = await yazRes.json();

        const haber = haberData.data?.attributes || haberData.data;

        setFormData({
          baslik: haber.baslik || '',
          slug: haber.slug || '',
          ozet: haber.ozet || '',
          icerik: haber.icerik || '',
          kategori: haber.kategori?.data?.id || '',
          yazar: haber.yazar?.data?.id || '',
          yayin_tarihi: haber.yayin_tarihi ? haber.yayin_tarihi.slice(0, 16) : '',
          durum: haber.durum || 'taslak',
          manset: haber.manset || false,
          sondakika: haber.sondakika || false,
        });

        if (haber.kapak_resmi?.data?.attributes?.url) {
          const url = haber.kapak_resmi.data.attributes.url;
          setMevcutKapak(url.startsWith('http') ? url : `${STRAPI_URL}${url}`);
        }

        setKategoriler(katData.data || []);
        setYazarlar(yazData.data || []);
      } catch (err) {
        console.error('Veri yuklenemedi:', err);
        setError('Haber yuklenemedi');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, getToken]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setKapakResmi(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setKapakPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const token = getToken();

    try {
      let kapakResmiId = null;

      // Yeni resim varsa yukle
      if (kapakResmi) {
        const uploadForm = new FormData();
        uploadForm.append('files', kapakResmi);

        const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: uploadForm,
        });

        if (!uploadRes.ok) {
          throw new Error('Resim yuklenemedi');
        }

        const uploadData = await uploadRes.json();
        kapakResmiId = uploadData[0]?.id;
      }

      // Haberi guncelle
      const haberData = {
        baslik: formData.baslik,
        slug: formData.slug,
        ozet: formData.ozet,
        icerik: formData.icerik,
        yayin_tarihi: formData.yayin_tarihi,
        durum: formData.durum,
        manset: formData.manset,
        sondakika: formData.sondakika,
        ...(formData.kategori && { kategori: formData.kategori }),
        ...(formData.yazar && { yazar: formData.yazar }),
        ...(kapakResmiId && { kapak_resmi: kapakResmiId }),
      };

      const response = await fetch(`${STRAPI_URL}/api/haberler/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: haberData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Haber guncellenemedi');
      }

      router.push('/admin/haberler');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol kolon */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="baslik" className="form-label">Baslik *</label>
                <input
                  type="text"
                  id="baslik"
                  name="baslik"
                  value={formData.baslik}
                  onChange={handleChange}
                  className="form-input text-lg font-semibold"
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="form-label">URL (Slug)</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">/haber/</span>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="form-input flex-1"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ozet" className="form-label">Ozet</label>
                <textarea
                  id="ozet"
                  name="ozet"
                  value={formData.ozet}
                  onChange={handleChange}
                  className="form-input"
                  rows={3}
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.ozet.length}/300</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <label htmlFor="icerik" className="form-label">Icerik *</label>
            <textarea
              id="icerik"
              name="icerik"
              value={formData.icerik}
              onChange={handleChange}
              className="form-input font-mono text-sm"
              rows={15}
              required
            />
          </div>
        </div>

        {/* Sag kolon */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Yayin Ayarlari</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="durum" className="form-label">Durum</label>
                <select id="durum" name="durum" value={formData.durum} onChange={handleChange} className="form-input">
                  <option value="taslak">Taslak</option>
                  <option value="yayinda">Yayinda</option>
                  <option value="arsiv">Arsiv</option>
                </select>
              </div>

              <div>
                <label htmlFor="yayin_tarihi" className="form-label">Yayin Tarihi</label>
                <input type="datetime-local" id="yayin_tarihi" name="yayin_tarihi" value={formData.yayin_tarihi} onChange={handleChange} className="form-input" />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="manset" checked={formData.manset} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">Manset haberi</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="sondakika" checked={formData.sondakika} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">Son dakika</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Kategori ve Yazar</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="kategori" className="form-label">Kategori</label>
                <select id="kategori" name="kategori" value={formData.kategori} onChange={handleChange} className="form-input">
                  <option value="">Kategori sec...</option>
                  {kategoriler.map((kat) => (
                    <option key={kat.id} value={kat.id}>{kat.attributes?.isim || kat.isim}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="yazar" className="form-label">Yazar</label>
                <select id="yazar" name="yazar" value={formData.yazar} onChange={handleChange} className="form-input">
                  <option value="">Yazar sec...</option>
                  {yazarlar.map((yaz) => (
                    <option key={yaz.id} value={yaz.id}>{yaz.attributes?.isim || yaz.isim}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Kapak Resmi</h3>
            <div className="space-y-4">
              {(kapakPreview || mevcutKapak) && (
                <img src={kapakPreview || mevcutKapak} alt="Kapak" className="w-full h-48 object-cover rounded-lg" />
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full btn btn-primary disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : 'Degisiklikleri Kaydet'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function HaberDuzenlePage() {
  return (
    <AdminAuthProvider>
      <AdminLayout title="Haberi Duzenle">
        <HaberDuzenleContent />
      </AdminLayout>
    </AdminAuthProvider>
  );
}
