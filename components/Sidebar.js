import Link from 'next/link';

export default function Sidebar({ kategoriler = [] }) {
  return (
    <div className="space-y-6">
      {/* Kategoriler */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-bold mb-4 pb-2 border-b border-red-600">Kategoriler</h3>
        <ul className="space-y-2">
          {kategoriler.map((kategori) => (
            <li key={kategori.id}>
              <Link
                href={`/kategori/${kategori.slug}`}
                className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: kategori.renk || '#dc2626' }}
                  />
                  {kategori.isim}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Reklam Alanı */}
      <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500 text-sm">
        <div className="aspect-[300/250] flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
          Reklam Alanı (300x250)
        </div>
      </div>

      {/* Sosyal Medya */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-bold mb-4 pb-2 border-b border-red-600">Bizi Takip Edin</h3>
        <div className="grid grid-cols-2 gap-2">
          <a href="#" className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            <span>Facebook</span>
          </a>
          <a href="#" className="flex items-center justify-center gap-2 bg-sky-500 text-white py-2 rounded hover:bg-sky-600 transition">
            <span>Twitter</span>
          </a>
          <a href="#" className="flex items-center justify-center gap-2 bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition">
            <span>Instagram</span>
          </a>
          <a href="#" className="flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
            <span>YouTube</span>
          </a>
        </div>
      </div>
    </div>
  );
}
