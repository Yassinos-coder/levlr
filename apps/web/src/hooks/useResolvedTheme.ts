import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/themeStore';
import type { ResolvedTheme } from '@/types/theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

export function useResolvedTheme(): ResolvedTheme {
  const mode = useThemeStore((state) => state.mode);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(DARK_QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  if (mode === 'system') return systemDark ? 'dark' : 'light';
  return mode;
}
