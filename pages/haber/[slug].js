import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ShareButtons from '../../components/ShareButtons';
import IlgiliHaberler from '../../components/IlgiliHaberler';
import CommentList from '../../components/CommentList';
import {
  getHaberBySlug,
  getAllHaberSlugs,
  getIlgiliHaberler,
  getKategoriler,
  getSiteAyarlari,
  getStrapiMedia,
  incrementOkunmaSayisi,
  getYorumlar,
} from '../../lib/strapi';
import {
  getNewsArticleSchema,
  getBreadcrumbSchema,
} from '../../lib/seo';

const SITE_URL = process.env.SITE_URL || 'https://example.com';

export default function HaberDetay({ haber, ilgiliHaberler, kategoriler, siteAyarlari }) {
  const router = useRouter();
  const [yorumlar, setYorumlar] = useState([]);

  useEffect(() => {
    if (haber?.id) {
      incrementOkunmaSayisi(haber.id);
      // Yorumlari yukle
      getYorumlar(haber.id).then(data => setYorumlar(data));
    }
  }, [haber?.id]);

  const handleCommentAdded = () => {
    // Yorumlari yeniden yukle
    if (haber?.id) {
      getYorumlar(haber.id).then(data => setYorumlar(data));
    }
  };

  if (router.isFallback) {
    return <div className="text-center py-20">Yukleniyor...</div>;
  }

  if (!haber) {
    return <div className="text-center py-20">Haber bulunamadi</div>;
  }

  const kapakResmi = getStrapiMedia(haber.kapak_resmi);
  const formattedDate = haber.yayin_tarihi
    ? format(new Date(haber.yayin_tarihi), 'd MMMM yyyy, HH:mm', { locale: tr })
    : '';

  return (
    <Layout kategoriler={kategoriler} siteAyarlari={siteAyarlari}>
      <Head>
        <title>{haber.seo_title || haber.baslik} - {siteAyarlari?.site_adi}</title>
        <meta name="description" content={haber.seo_description || haber.spot} />
        
        {/* Canonical & AMP */}
        <link rel="canonical" href={`${SITE_URL}/haber/${haber.slug}`} />
        <link rel="amphtml" href={`${SITE_URL}/haber/${haber.slug}/amp`} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={haber.baslik} />
        <meta property="og:description" content={haber.spot} />
        {kapakResmi && <meta property="og:image" content={kapakResmi} />}
        <meta property="article:published_time" content={haber.yayin_tarihi} />
        <meta property="article:section" content={haber.kategori?.isim} />
        
        {/* Google News */}
        <meta name="news_keywords" content={haber.news_keywords} />
        <meta name="author" content={haber.yazar?.isim} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getNewsArticleSchema(haber)) }}
        />
      </Head>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <article className="lg:col-span-2">
            {/* Kategori */}
            {haber.kategori && (
              <Link
                href={`/kategori/${haber.kategori.slug}`}
                className="inline-block px-3 py-1 text-sm text-white rounded mb-3"
                style={{ backgroundColor: haber.kategori.renk || '#dc2626' }}
              >
                {haber.kategori.isim}
              </Link>
            )}

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{haber.baslik}</h1>
            <p className="text-xl text-gray-600 mb-4">{haber.spot}</p>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6 pb-4 border-b">
              {haber.yazar && <span>{haber.yazar.isim}</span>}
              <time dateTime={haber.yayin_tarihi}>{formattedDate}</time>
              <span>{haber.okunma_sayisi || 0} okunma</span>
            </div>

            {/* Kapak */}
            {kapakResmi && (
              <Image
                src={kapakResmi}
                alt={haber.baslik}
                width={800}
                height={450}
                className="w-full rounded-lg mb-6"
                priority
              />
            )}

            <ShareButtons url={`${SITE_URL}/haber/${haber.slug}`} title={haber.baslik} />

            {/* İçerik */}
            <div
              className="prose prose-lg max-w-none mt-6"
              dangerouslySetInnerHTML={{ __html: haber.icerik }}
            />

            {/* Etiketler */}
            {haber.etiketler?.length > 0 && (
              <div className="mt-8 pt-6 border-t flex flex-wrap gap-2">
                {haber.etiketler.map((etiket) => (
                  <Link
                    key={etiket.id}
                    href={`/etiket/${etiket.slug}`}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                  >
                    #{etiket.isim}
                  </Link>
                ))}
              </div>
            )}

            {ilgiliHaberler.length > 0 && <IlgiliHaberler haberler={ilgiliHaberler} />}

            {/* Yorumlar */}
            {haber.yorum_aktif !== false && (
              <CommentList
                yorumlar={yorumlar}
                haberId={haber.id}
                onCommentAdded={handleCommentAdded}
              />
            )}
          </article>

          <aside className="lg:col-span-1">
            <Sidebar kategoriler={kategoriler} />
          </aside>
        </div>
      </main>
    </Layout>
  );
}

export async function getStaticPaths() {
  const haberler = await getAllHaberSlugs();
  return {
    paths: haberler.map((h) => ({ params: { slug: h.slug } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const [haber, kategoriler, siteAyarlari] = await Promise.all([
    getHaberBySlug(params.slug),
    getKategoriler(),
    getSiteAyarlari(),
  ]);

  if (!haber) return { notFound: true };

  const ilgiliHaberler = await getIlgiliHaberler(params.slug, haber.kategori?.slug, 4);

  return {
    props: { haber, ilgiliHaberler, kategoriler, siteAyarlari },
    revalidate: 60,
  };
}
