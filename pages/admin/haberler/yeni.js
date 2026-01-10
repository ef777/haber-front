import { useState, useEffect, useCallback } from 'react';
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

function YeniHaberContent() {
  const { getToken } = useAdminAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    baslik: '',
    slug: '',
    ozet: '',
    icerik: '',
    kategori: '',
    yazar: '',
    yayin_tarihi: new Date().toISOString().slice(0, 16),
    durum: 'taslak',
    manset: false,
    sondakika: false,
  });

  const [kategoriler, setKategoriler] = useState([]);
  const [yazarlar, setYazarlar] = useState([]);
  const [kapakResmi, setKapakResmi] = useState(null);
  const [kapakPreview, setKapakPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Kategorileri ve yazarlari yukle
  useEffect(() => {
    async function fetchData() {
      const token = getToken();
      try {
        const [katRes, yazRes] = await Promise.all([
          fetch(`${STRAPI_URL}/api/kategoriler?filters[aktif][$eq]=true`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${STRAPI_URL}/api/yazarlar?filters[aktif][$eq]=true`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const katData = await katRes.json();
        const yazData = await yazRes.json();

        setKategoriler(katData.data || []);
        setYazarlar(yazData.data || []);
      } catch (err) {
        console.error('Veri yuklenemedi:', err);
      }
    }
    fetchData();
  }, [getToken]);

  // Baslik degisince slug olustur
  useEffect(() => {
    if (formData.baslik) {
      setFormData(prev => ({
        ...prev,
        slug: slugify(formData.baslik),
      }));
    }
  }, [formData.baslik]);

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

      // Resim varsa yukle
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

      // Haberi olustur
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

      const response = await fetch(`${STRAPI_URL}/api/haberler`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: haberData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Haber olusturulamadi');
      }

      router.push('/admin/haberler');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol kolon - Ana form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Baslik */}
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
                  placeholder="Haber basligi..."
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="form-label">URL (Slug)</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">/haber/</span>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="form-input flex-1"
                    placeholder="haber-url"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ozet" className="form-label">Ozet (max 300 karakter)</label>
                <textarea
                  id="ozet"
                  name="ozet"
                  value={formData.ozet}
                  onChange={handleChange}
                  className="form-input"
                  rows={3}
                  maxLength={300}
                  placeholder="Kisa ozet..."
                />
                <p className="text-xs text-gray-500 mt-1">{formData.ozet.length}/300</p>
              </div>
            </div>
          </div>

          {/* Icerik */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <label htmlFor="icerik" className="form-label">Icerik *</label>
            <textarea
              id="icerik"
              name="icerik"
              value={formData.icerik}
              onChange={handleChange}
              className="form-input font-mono text-sm"
              rows={15}
              placeholder="Haber icerigi... (HTML desteklenir)"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              HTML etiketleri kullanabilirsiniz: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;blockquote&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;
            </p>
          </div>
        </div>

        {/* Sag kolon - Ayarlar */}
        <div className="space-y-6">
          {/* Yayin ayarlari */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Yayin Ayarlari</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="durum" className="form-label">Durum</label>
                <select
                  id="durum"
                  name="durum"
                  value={formData.durum}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="taslak">Taslak</option>
                  <option value="yayinda">Yayinda</option>
                  <option value="arsiv">Arsiv</option>
                </select>
              </div>

              <div>
                <label htmlFor="yayin_tarihi" className="form-label">Yayin Tarihi</label>
                <input
                  type="datetime-local"
                  id="yayin_tarihi"
                  name="yayin_tarihi"
                  value={formData.yayin_tarihi}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="manset"
                    checked={formData.manset}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Manset haberi</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="sondakika"
                    checked={formData.sondakika}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Son dakika</span>
                </label>
              </div>
            </div>
          </div>

          {/* Kategori ve Yazar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Kategori ve Yazar</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="kategori" className="form-label">Kategori</label>
                <select
                  id="kategori"
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Kategori sec...</option>
                  {kategoriler.map((kat) => (
                    <option key={kat.id} value={kat.id}>
                      {kat.attributes?.isim || kat.isim}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="yazar" className="form-label">Yazar</label>
                <select
                  id="yazar"
                  name="yazar"
                  value={formData.yazar}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Yazar sec...</option>
                  {yazarlar.map((yaz) => (
                    <option key={yaz.id} value={yaz.id}>
                      {yaz.attributes?.isim || yaz.isim}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Kapak resmi */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Kapak Resmi</h3>
            <div className="space-y-4">
              {kapakPreview && (
                <div className="relative">
                  <img
                    src={kapakPreview}
                    alt="Onizleme"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => { setKapakResmi(null); setKapakPreview(null); }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <label className="block">
                <span className="sr-only">Resim sec</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100
                    dark:file:bg-primary-900/30 dark:file:text-primary-400
                  "
                />
              </label>
            </div>
          </div>

          {/* Kaydet butonu */}
          <button
            type="submit"
            disabled={saving}
            className="w-full btn btn-primary disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Kaydediliyor...
              </span>
            ) : (
              'Haberi Kaydet'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function YeniHaberPage() {
  return (
    <AdminAuthProvider>
      <AdminLayout title="Yeni Haber Ekle">
        <YeniHaberContent />
      </AdminLayout>
    </AdminAuthProvider>
  );
}
