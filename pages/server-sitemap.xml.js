import { getServerSideSitemap } from 'next-sitemap';
import { getAllHaberSlugs, getKategoriler, getYazarlar } from '../lib/strapi';

const SITE_URL = process.env.SITE_URL || 'https://example.com';

export async function getServerSideProps(ctx) {
  const [haberler, kategoriler, yazarlar] = await Promise.all([
    getAllHaberSlugs(),
    getKategoriler(),
    getYazarlar(),
  ]);

  const haberFields = haberler.map((haber) => ({
    loc: `${SITE_URL}/haber/${haber.slug}`,
    lastmod: haber.updatedAt || new Date().toISOString(),
    changefreq: 'daily',
    priority: 0.8,
  }));

  const kategoriFields = kategoriler.map((kategori) => ({
    loc: `${SITE_URL}/kategori/${kategori.slug}`,
    lastmod: new Date().toISOString(),
    changefreq: 'hourly',
    priority: 0.9,
  }));

  const yazarFields = yazarlar.map((yazar) => ({
    loc: `${SITE_URL}/yazar/${yazar.slug}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: 0.6,
  }));

  const fields = [...haberFields, ...kategoriFields, ...yazarFields];

  return getServerSideSitemap(ctx, fields);
}

export default function Sitemap() {}
