// components/MansetSlider.js
import Link from 'next/link';
import Image from 'next/image';
import { getStrapiMedia } from '../lib/strapi';

export default function MansetSlider({ haberler }) {
  if (!haberler.length) return null;
  
  const anaManset = haberler[0];
  const yanMansetler = haberler.slice(1, 5);
  const anaResim = getStrapiMedia(anaManset.kapak_resmi);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Ana Manşet */}
      <Link href={`/haber/${anaManset.slug}`} className="relative aspect-[16/10] md:aspect-[4/3] group">
        {anaResim && (
          <Image
            src={anaResim}
            alt={anaManset.baslik}
            fill
            className="object-cover rounded-lg"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-lg" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          {anaManset.kategori && (
            <span
              className="inline-block px-2 py-1 text-xs font-medium text-white rounded mb-2"
              style={{ backgroundColor: anaManset.kategori.renk || '#dc2626' }}
            >
              {anaManset.kategori.isim}
            </span>
          )}
          <h2 className="text-white text-xl md:text-2xl font-bold line-clamp-3 group-hover:underline">
            {anaManset.baslik}
          </h2>
        </div>
      </Link>

      {/* Yan Manşetler */}
      <div className="grid grid-cols-2 gap-4">
        {yanMansetler.map((haber) => {
          const resim = getStrapiMedia(haber.kapak_resmi);
          return (
            <Link key={haber.id} href={`/haber/${haber.slug}`} className="relative aspect-[4/3] group">
              {resim && (
                <Image src={resim} alt={haber.baslik} fill className="object-cover rounded-lg" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:underline">
                  {haber.baslik}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
