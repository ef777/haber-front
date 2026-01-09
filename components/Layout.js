import Link from 'next/link';
import { useState } from 'react';
import { getStrapiMedia } from '../lib/strapi';

export default function Layout({ children, kategoriler = [], siteAyarlari }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const siteName = siteAyarlari?.site_adi || 'Haber Sitesi';
  const logo = getStrapiMedia(siteAyarlari?.logo);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        {/* Üst Bar */}
        <div className="bg-gray-900 text-white text-sm py-1">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <span>{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <div className="flex gap-4">
              {siteAyarlari?.sosyal_medya?.twitter && (
                <a href={siteAyarlari.sosyal_medya.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>
              )}
              {siteAyarlari?.sosyal_medya?.facebook && (
                <a href={siteAyarlari.sosyal_medya.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
              )}
            </div>
          </div>
        </div>

        {/* Logo & Arama */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              {logo ? (
                <img src={logo} alt={siteName} className="h-10" />
              ) : (
                <span className="text-2xl font-bold text-red-600">{siteName}</span>
              )}
            </Link>

            {/* Arama */}
            <form action="/arama" method="GET" className="hidden md:flex items-center">
              <input
                type="search"
                name="q"
                placeholder="Haber ara..."
                className="border rounded-l px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-r hover:bg-red-700">
                Ara
              </button>
            </form>

            {/* Mobil Menü Butonu */}
            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menü"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Navigasyon */}
        <nav className={`bg-red-600 ${menuOpen ? 'block' : 'hidden'} md:block`}>
          <div className="container mx-auto px-4">
            <ul className="flex flex-col md:flex-row">
              <li>
                <Link href="/" className="block px-4 py-3 text-white hover:bg-red-700 font-medium">
                  Ana Sayfa
                </Link>
              </li>
              {kategoriler.slice(0, 8).map((kategori) => (
                <li key={kategori.id}>
                  <Link
                    href={`/kategori/${kategori.slug}`}
                    className="block px-4 py-3 text-white hover:bg-red-700"
                  >
                    {kategori.isim}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Hakkında */}
            <div>
              <h3 className="text-lg font-bold mb-4">{siteName}</h3>
              <p className="text-gray-400 text-sm">
                {siteAyarlari?.footer_text || 'Türkiye ve dünyadan en güncel haberler'}
              </p>
            </div>

            {/* Kategoriler */}
            <div>
              <h3 className="text-lg font-bold mb-4">Kategoriler</h3>
              <ul className="space-y-2">
                {kategoriler.slice(0, 6).map((kategori) => (
                  <li key={kategori.id}>
                    <Link href={`/kategori/${kategori.slug}`} className="text-gray-400 hover:text-white text-sm">
                      {kategori.isim}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kurumsal */}
            <div>
              <h3 className="text-lg font-bold mb-4">Kurumsal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/hakkimizda" className="text-gray-400 hover:text-white">Hakkımızda</Link></li>
                <li><Link href="/iletisim" className="text-gray-400 hover:text-white">İletişim</Link></li>
                <li><Link href="/kunye" className="text-gray-400 hover:text-white">Künye</Link></li>
                <li><Link href="/gizlilik" className="text-gray-400 hover:text-white">Gizlilik Politikası</Link></li>
                <li><Link href="/rss/feed.xml" className="text-gray-400 hover:text-white">RSS</Link></li>
              </ul>
            </div>

            {/* İletişim */}
            <div>
              <h3 className="text-lg font-bold mb-4">İletişim</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {siteAyarlari?.iletisim_email && (
                  <li>Email: {siteAyarlari.iletisim_email}</li>
                )}
                {siteAyarlari?.iletisim_telefon && (
                  <li>Tel: {siteAyarlari.iletisim_telefon}</li>
                )}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>{siteAyarlari?.copyright || `© ${new Date().getFullYear()} ${siteName}. Tüm hakları saklıdır.`}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
