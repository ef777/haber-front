import axios from 'axios';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

// Axios instance
const api = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
  },
});

// Helper: Strapi response formatını düzelt
function flattenAttributes(data) {
  if (!data) return null;
  
  if (Array.isArray(data)) {
    return data.map(item => flattenAttributes(item));
  }
  
  if (typeof data === 'object') {
    if (data.attributes) {
      const flattened = {
        id: data.id,
        ...data.attributes,
      };
      
      // İç içe relationları da düzelt
      Object.keys(flattened).forEach(key => {
        if (flattened[key]?.data) {
          flattened[key] = flattenAttributes(flattened[key].data);
        }
      });
      
      return flattened;
    }
  }
  
  return data;
}

// Strapi media URL'ini tam URL'e çevir
export function getStrapiMedia(media) {
  if (!media) return null;
  
  const url = media.url || media;
  
  if (url.startsWith('http')) {
    return url;
  }
  
  return `${STRAPI_URL}${url}`;
}

// ==================== HABER ====================

export async function getHaberler(params = {}) {
  const {
    page = 1,
    pageSize = 10,
    kategori,
    yazar,
    etiket,
    sondakika,
    manset,
    search,
    sort = 'yayin_tarihi:desc',
  } = params;

  const query = new URLSearchParams({
    'pagination[page]': page,
    'pagination[pageSize]': pageSize,
    'sort': sort,
    'filters[durum][$eq]': 'yayinda',
    'populate[kapak_resmi][fields][0]': 'url',
    'populate[kapak_resmi][fields][1]': 'alternativeText',
    'populate[kapak_resmi][fields][2]': 'width',
    'populate[kapak_resmi][fields][3]': 'height',
    'populate[kategori][fields][0]': 'isim',
    'populate[kategori][fields][1]': 'slug',
    'populate[kategori][fields][2]': 'renk',
    'populate[yazar][fields][0]': 'isim',
    'populate[yazar][fields][1]': 'slug',
    'populate[yazar][populate][foto][fields][0]': 'url',
  });

  if (kategori) query.append('filters[kategori][slug][$eq]', kategori);
  if (yazar) query.append('filters[yazar][slug][$eq]', yazar);
  if (etiket) query.append('filters[etiketler][slug][$eq]', etiket);
  if (sondakika) query.append('filters[sondakika][$eq]', 'true');
  if (manset) query.append('filters[manset][$eq]', 'true');
  if (search) query.append('filters[$or][0][baslik][$containsi]', search);

  try {
    const response = await api.get(`/haberler?${query.toString()}`);
    return {
      data: flattenAttributes(response.data.data),
      pagination: response.data.meta?.pagination,
    };
  } catch (error) {
    console.error('getHaberler error:', error);
    return { data: [], pagination: null };
  }
}

export async function getHaberBySlug(slug) {
  try {
    const response = await api.get('/haberler', {
      params: {
        'filters[slug][$eq]': slug,
        'filters[durum][$eq]': 'yayinda',
        'populate': '*',
      },
    });

    const data = response.data.data?.[0];
    return flattenAttributes(data);
  } catch (error) {
    console.error('getHaberBySlug error:', error);
    return null;
  }
}

export async function getMansetHaberler(limit = 5) {
  try {
    const response = await api.get('/haberler', {
      params: {
        'filters[manset][$eq]': true,
        'filters[durum][$eq]': 'yayinda',
        'sort': 'manset_sira:asc',
        'pagination[limit]': limit,
        'populate[kapak_resmi][fields][0]': 'url',
        'populate[kategori][fields][0]': 'isim',
        'populate[kategori][fields][1]': 'slug',
        'populate[kategori][fields][2]': 'renk',
      },
    });
    return flattenAttributes(response.data.data);
  } catch (error) {
    console.error('getMansetHaberler error:', error);
    return [];
  }
}

export async function getSonDakikaHaberler(limit = 10) {
  try {
    const response = await api.get('/haberler', {
      params: {
        'filters[sondakika][$eq]': true,
        'filters[durum][$eq]': 'yayinda',
        'sort': 'yayin_tarihi:desc',
        'pagination[limit]': limit,
        'populate[kapak_resmi][fields][0]': 'url',
        'populate[kategori][fields][0]': 'isim',
        'populate[kategori][fields][1]': 'slug',
      },
    });
    return flattenAttributes(response.data.data);
  } catch (error) {
    console.error('getSonDakikaHaberler error:', error);
    return [];
  }
}

export async function getIlgiliHaberler(haberSlug, kategoriSlug, limit = 4) {
  try {
    const response = await api.get('/haberler', {
      params: {
        'filters[slug][$ne]': haberSlug,
        'filters[kategori][slug][$eq]': kategoriSlug,
        'filters[durum][$eq]': 'yayinda',
        'sort': 'yayin_tarihi:desc',
        'pagination[limit]': limit,
        'populate[kapak_resmi][fields][0]': 'url',
        'populate[kategori][fields][0]': 'isim',
        'populate[kategori][fields][1]': 'slug',
      },
    });
    return flattenAttributes(response.data.data);
  } catch (error) {
    console.error('getIlgiliHaberler error:', error);
    return [];
  }
}

// Google News Sitemap için - Son 48 saat haberler
export async function getNewsHaberler() {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  try {
    const response = await api.get('/haberler', {
      params: {
        'filters[durum][$eq]': 'yayinda',
        'filters[yayin_tarihi][$gte]': twoDaysAgo.toISOString(),
        'sort': 'yayin_tarihi:desc',
        'pagination[limit]': 1000,
        'populate[kategori][fields][0]': 'isim',
      },
    });
    return flattenAttributes(response.data.data);
  } catch (error) {
    console.error('getNewsHaberler error:', error);
    return [];
  }
}

// Tüm haber slug'ları (sitemap için)
export async function getAllHaberSlugs() {
  try {
    const response = await api.get('/haberler', {
      params: {
        'filters[durum][$eq]': 'yayinda',
        'fields[0]': 'slug',
        'fields[1]': 'updatedAt',
        'pagination[limit]': 10000,
      },
    });
    return flattenAttributes(response.data.data);
  } catch (error) {
    console.error('getAllHaberSlugs error:', error);
    return [];
  }
}

// ==================== KATEGORİ ====================

export async function getKategoriler() {
  try {
    const response = await api.get('/kategoriler', {
      params: {
        'filters[aktif][$eq]': true,
        'sort': 'sira:asc',
        'populate': '*',
      },
    });
    return flattenAttributes(response.data.data);
  } catch (error) {
    console.error('getKategoriler error:', error);
    return [];
  }
}

export async function getKategoriBySlug(slug) {
  try {
    const response = await api.get('/kategoriler', {
      params: {
        'filters[slug][$eq]': slug,
        'filters[aktif][$eq]': true,
      },
    });
    return flattenAttributes(response.data.data?.[0]);
  } catch (error) {
    console.error('getKategoriBySlug error:', error);
    return null;
  }
}

// ==================== YAZAR ====================

export async function getYazarlar() {
  try {
    const response = await api.get('/yazarlar', {
      params: {
        'filters[aktif][$eq]': true,
        'populate': '*',
      },
    });
    return flattenAttributes(response.data.data);
  } catch (error) {
    console.error('getYazarlar error:', error);
    return [];
  }
}

export async function getYazarBySlug(slug) {
  try {
    const response = await api.get('/yazarlar', {
      params: {
        'filters[slug][$eq]': slug,
        'populate': '*',
      },
    });
    return flattenAttributes(response.data.data?.[0]);
  } catch (error) {
    console.error('getYazarBySlug error:', error);
    return null;
  }
}

// ==================== ETİKET ====================

export async function getEtiketBySlug(slug) {
  try {
    const response = await api.get('/etiketler', {
      params: {
        'filters[slug][$eq]': slug,
      },
    });
    return flattenAttributes(response.data.data?.[0]);
  } catch (error) {
    console.error('getEtiketBySlug error:', error);
    return null;
  }
}

// ==================== SİTE AYARLARI ====================

export async function getSiteAyarlari() {
  try {
    const response = await api.get('/site-ayarlari', {
      params: {
        'populate': '*',
      },
    });
    return flattenAttributes(response.data.data);
  } catch (error) {
    console.error('getSiteAyarlari error:', error);
    return null;
  }
}

// ==================== REKLAM ====================

export async function getReklamlar(konum) {
  const now = new Date().toISOString();
  
  try {
    const response = await api.get('/reklamlar', {
      params: {
        'filters[konum][$eq]': konum,
        'filters[aktif][$eq]': true,
        'filters[$or][0][bitis_tarihi][$gte]': now,
        'filters[$or][1][bitis_tarihi][$null]': true,
        'populate': '*',
      },
    });
    return flattenAttributes(response.data.data);
  } catch (error) {
    console.error('getReklamlar error:', error);
    return [];
  }
}

// ==================== MENÜ ====================

export async function getMenuler() {
  try {
    const response = await api.get('/menuler', {
      params: {
        'filters[aktif][$eq]': true,
        'sort': 'sira:asc',
        'populate': '*',
      },
    });
    return flattenAttributes(response.data.data);
  } catch (error) {
    console.error('getMenuler error:', error);
    return [];
  }
}

// ==================== OKUNMA SAYISI ====================

export async function incrementOkunmaSayisi(haberId) {
  try {
    // Önce mevcut değeri al
    const response = await api.get(`/haberler/${haberId}`, {
      params: {
        'fields[0]': 'okunma_sayisi',
      },
    });
    
    const current = response.data.data?.attributes?.okunma_sayisi || 0;
    
    // Artır
    await api.put(`/haberler/${haberId}`, {
      data: {
        okunma_sayisi: current + 1,
      },
    });
  } catch (error) {
    console.error('incrementOkunmaSayisi error:', error);
  }
}

export default api;
