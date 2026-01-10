import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(undefined);

// Hex rengi HSL formatina cevir
function hexToHSL(hex) {
  if (!hex) return null;

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ThemeProvider({ children, temaAyarlari }) {
  const [theme, setTheme] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // localStorage'dan tema yukle
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    if (saved) {
      setTheme(saved);
    } else if (temaAyarlari?.varsayilan_tema) {
      setTheme(temaAyarlari.varsayilan_tema);
    }
  }, [temaAyarlari]);

  // Tema degisikliklerini uygula
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    let resolved = theme;

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolved = prefersDark ? 'dark' : 'light';
    }

    setResolvedTheme(resolved);

    // Dark mode sinifini ayarla
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    root.setAttribute('data-theme', resolved);

    // CSS variables uygula
    if (temaAyarlari) {
      // Ana renkler
      if (temaAyarlari.ana_renk) {
        root.style.setProperty('--color-primary', temaAyarlari.ana_renk);
        const hsl = hexToHSL(temaAyarlari.ana_renk);
        if (hsl) root.style.setProperty('--color-primary-hsl', hsl);
      }
      if (temaAyarlari.ikincil_renk) {
        root.style.setProperty('--color-secondary', temaAyarlari.ikincil_renk);
      }
      if (temaAyarlari.vurgu_renk) {
        root.style.setProperty('--color-accent', temaAyarlari.vurgu_renk);
      }

      // Fontlar
      if (temaAyarlari.baslik_fontu) {
        root.style.setProperty('--font-heading', `'${temaAyarlari.baslik_fontu}', Georgia, serif`);
      }
      if (temaAyarlari.govde_fontu) {
        root.style.setProperty('--font-body', `'${temaAyarlari.govde_fontu}', system-ui, sans-serif`);
      }

      // Font boyutu
      if (temaAyarlari.font_size_base) {
        root.style.setProperty('--font-size-base', `${temaAyarlari.font_size_base}px`);
      }

      // Mod bazli renkler
      const modeColors = resolved === 'dark' ? temaAyarlari.dark_mode : temaAyarlari.light_mode;
      if (modeColors) {
        if (modeColors.background) root.style.setProperty('--color-background', modeColors.background);
        if (modeColors.surface) root.style.setProperty('--color-surface', modeColors.surface);
        if (modeColors.text_primary) root.style.setProperty('--color-text-primary', modeColors.text_primary);
        if (modeColors.text_secondary) root.style.setProperty('--color-text-secondary', modeColors.text_secondary);
        if (modeColors.border) root.style.setProperty('--color-border', modeColors.border);
      }
    }
  }, [theme, mounted, temaAyarlari]);

  // System preference degisikliklerini dinle
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [resolvedTheme]);

  const setThemeMode = useCallback((mode) => {
    setTheme(mode);
    localStorage.setItem('theme', mode);
  }, []);

  // Hydration mismatch onlemek icin
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: 'system', resolvedTheme: 'light', toggleTheme: () => {}, setTheme: () => {} }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme: setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
