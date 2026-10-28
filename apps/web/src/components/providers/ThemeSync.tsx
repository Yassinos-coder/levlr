import { useEffect } from 'react';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';

export function ThemeSync() {
  const theme = useResolvedTheme();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return null;
}
