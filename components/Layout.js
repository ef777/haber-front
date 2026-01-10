import Link from 'next/link';
import { useState } from 'react';
import { getStrapiMedia } from '../lib/strapi';
import ThemeToggle from './ThemeToggle';

export default function Layout({ children, kategoriler = [], siteAyarlari }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const siteName = siteAyarlari?.site_adi || 'Haber Sitesi';
  const logo = getStrapiMedia(siteAyarlari?.logo);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-surface shadow-sm sticky top-0 z-50 border-b border-custom">
        {/* Ust Bar - Tarih ve Sosyal Medya */}
        <div className="bg-gray-900 dark:bg-gray-950 text-white text-sm py-2">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <span className="text-gray-300">
              {new Date().toLocaleDateString('tr-TR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <div className="flex items-center gap-4">
              {siteAyarlari?.sosyal_medya?.twitter && (
                <a href={siteAyarlari.sosyal_medya.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                  <TwitterIcon className="w-4 h-4" />
                </a>
              )}
              {siteAyarlari?.sosyal_medya?.facebook && (
                <a href={siteAyarlari.sosyal_medya.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {siteAyarlari?.sosyal_medya?.instagram && (
                <a href={siteAyarlari.sosyal_medya.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              <ThemeToggle className="ml-2" />
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
                <span className="masthead-title text-2xl md:text-3xl" style={{ color: 'var(--color-primary)' }}>
                  {siteName}
                </span>
              )}
            </Link>

            {/* Arama */}
            <form action="/arama" method="GET" className="hidden md:flex items-center">
              <input
                type="search"
                name="q"
                placeholder="Haber ara..."
                className="form-input rounded-r-none border-r-0 w-64"
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-r-lg transition-colors"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            </form>

            {/* Mobil Menu Butonu */}
            <button
              className="md:hidden p-2 text-gray-600 dark:text-gray-300"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
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
        <nav
          className={`${menuOpen ? 'block' : 'hidden'} md:block`}
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <div className="container mx-auto px-4">
            <ul className="flex flex-col md:flex-row">
              <li>
                <Link href="/" className="block px-4 py-3 text-white hover:bg-white/10 font-medium transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              {kategoriler.slice(0, 8).map((kategori) => (
                <li key={kategori.id}>
                  <Link
                    href={`/kategori/${kategori.slug}`}
                    className="block px-4 py-3 text-white hover:bg-white/10 transition-colors"
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
      <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Hakkinda */}
            <div>
              <h3 className="text-lg font-bold mb-4 font-heading">{siteName}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {siteAyarlari?.footer_text || 'Turkiye ve dunyadan en guncel haberler, son dakika gelismeleri ve ozel icerikler.'}
              </p>
              <div className="flex gap-3 mt-4">
                {siteAyarlari?.sosyal_medya?.twitter && (
                  <a href={siteAyarlari.sosyal_medya.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                    <TwitterIcon className="w-5 h-5" />
                  </a>
                )}
                {siteAyarlari?.sosyal_medya?.facebook && (
                  <a href={siteAyarlari.sosyal_medya.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                    <FacebookIcon className="w-5 h-5" />
                  </a>
                )}
                {siteAyarlari?.sosyal_medya?.instagram && (
                  <a href={siteAyarlari.sosyal_medya.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                    <InstagramIcon className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Kategoriler */}
            <div>
              <h3 className="text-lg font-bold mb-4 font-heading">Kategoriler</h3>
              <ul className="space-y-2">
                {kategoriler.slice(0, 6).map((kategori) => (
                  <li key={kategori.id}>
                    <Link href={`/kategori/${kategori.slug}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {kategori.isim}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kurumsal */}
            <div>
              <h3 className="text-lg font-bold mb-4 font-heading">Kurumsal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/hakkimizda" className="text-gray-400 hover:text-white transition-colors">Hakkimizda</Link></li>
                <li><Link href="/iletisim" className="text-gray-400 hover:text-white transition-colors">Iletisim</Link></li>
                <li><Link href="/kunye" className="text-gray-400 hover:text-white transition-colors">Kunye</Link></li>
                <li><Link href="/gizlilik" className="text-gray-400 hover:text-white transition-colors">Gizlilik Politikasi</Link></li>
                <li><Link href="/rss/feed.xml" className="text-gray-400 hover:text-white transition-colors">RSS Beslemesi</Link></li>
              </ul>
            </div>

            {/* Iletisim */}
            <div>
              <h3 className="text-lg font-bold mb-4 font-heading">Iletisim</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                {siteAyarlari?.iletisim_email && (
                  <li className="flex items-center gap-2">
                    <EmailIcon className="w-4 h-4" />
                    <span>{siteAyarlari.iletisim_email}</span>
                  </li>
                )}
                {siteAyarlari?.iletisim_telefon && (
                  <li className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{siteAyarlari.iletisim_telefon}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 pt-8 text-center text-sm text-gray-400">
            <p>{siteAyarlari?.copyright || `© ${new Date().getFullYear()} ${siteName}. Tum haklari saklidir.`}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Ikonlar
function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function TwitterIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function EmailIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PhoneIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}
