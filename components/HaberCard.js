import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getStrapiMedia } from '../lib/strapi';

export default function HaberCard({ haber, size = 'medium' }) {
  const kapakResmi = getStrapiMedia(haber.kapak_resmi);
  const formattedDate = haber.yayin_tarihi
    ? format(new Date(haber.yayin_tarihi), 'd MMM yyyy', { locale: tr })
    : '';

  if (size === 'small') {
    return (
      <article className="flex gap-3 group">
        {kapakResmi && (
          <Link href={`/haber/${haber.slug}`} className="flex-shrink-0">
            <Image
              src={kapakResmi}
              alt={haber.baslik}
              width={100}
              height={70}
              className="rounded object-cover group-hover:opacity-90 transition"
            />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <Link href={`/haber/${haber.slug}`}>
            <h3 className="text-sm font-medium line-clamp-2 group-hover:text-red-600 transition">
              {haber.baslik}
            </h3>
          </Link>
          <time className="text-xs text-gray-500 mt-1 block">{formattedDate}</time>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group">
      {kapakResmi && (
        <Link href={`/haber/${haber.slug}`} className="block relative aspect-video">
          <Image
            src={kapakResmi}
            alt={haber.baslik}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
          />
          {haber.kategori && (
            <span
              className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-white rounded"
              style={{ backgroundColor: haber.kategori.renk || '#dc2626' }}
            >
              {haber.kategori.isim}
            </span>
          )}
          {haber.sondakika && (
            <span className="absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white bg-red-600 rounded animate-pulse">
              SON DAKİKA
            </span>
          )}
        </Link>
      )}
      <div className="p-4">
        <Link href={`/haber/${haber.slug}`}>
          <h2 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-red-600 transition">
            {haber.baslik}
          </h2>
        </Link>
        {size !== 'compact' && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{haber.spot}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <time dateTime={haber.yayin_tarihi}>{formattedDate}</time>
          {haber.okunma_sayisi > 0 && (
            <span>{haber.okunma_sayisi} okunma</span>
          )}
        </div>
      </div>
    </article>
  );
}
