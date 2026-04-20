'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'site-theme';

function applyTheme(next: Theme) {
  const root = document.documentElement;
  const body = document.body;
  if (next === 'dark') {
    root.classList.add('dark');
    body.classList.add('dark');
  } else {
    root.classList.remove('dark');
    body.classList.remove('dark');
  }
  root.style.colorScheme = next;
  body.style.colorScheme = next;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved === 'light' || saved === 'dark' ? saved : prefersDark ? 'dark' : 'light';

    setTheme(initial);
    applyTheme(initial);
    window.localStorage.setItem(STORAGE_KEY, initial);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    if (typeof window === 'undefined') return;
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggle: () => {
        setTheme((prev) => {
          const next: Theme = prev === 'dark' ? 'light' : 'dark';
          applyTheme(next);
          if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, next);
          return next;
        });
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
