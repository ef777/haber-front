import { useEffect, useState } from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import { getTemaAyarlari } from '../lib/strapi';

export default function App({ Component, pageProps }) {
  const [temaAyarlari, setTemaAyarlari] = useState(null);

  useEffect(() => {
    // Tema ayarlarini yukle
    async function loadTemaAyarlari() {
      try {
        const ayarlar = await getTemaAyarlari();
        setTemaAyarlari(ayarlar);
      } catch (error) {
        console.error('Tema ayarlari yuklenemedi:', error);
      }
    }
    loadTemaAyarlari();
  }, []);

  return (
    <>
      <Head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@400;700&family=Roboto+Slab:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=PT+Serif:ital,wght@0,400;0,700;1,400&family=Source+Serif+Pro:wght@400;600&family=Open+Sans:wght@400;500;600&family=Roboto:wght@400;500;700&family=Lato:wght@400;700&family=Source+Sans+Pro:wght@400;600&family=Noto+Sans:wght@400;500;600&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <ThemeProvider temaAyarlari={temaAyarlari}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
