import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SonDakikaBanner({ haberler }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (haberler.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % haberler.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [haberler.length]);

  if (!haberler.length) return null;

  return (
    <div className="bg-red-600 text-white py-2">
      <div className="container mx-auto px-4 flex items-center">
        <span className="bg-white text-red-600 px-3 py-1 text-sm font-bold rounded mr-4 flex-shrink-0 animate-pulse">
          SON DAKİKA
        </span>
        <div className="overflow-hidden flex-1">
          <Link
            href={`/haber/${haberler[currentIndex].slug}`}
            className="block truncate hover:underline"
          >
            {haberler[currentIndex].baslik}
          </Link>
        </div>
      </div>
    </div>
  );
}
