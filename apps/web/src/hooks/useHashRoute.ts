import { useSyncExternalStore } from 'react';

const subscribe = (callback: () => void) => {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
};

const getSnapshot = () => window.location.hash.replace(/^#/, '') || '/';

export function useHashRoute() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function navigate(path: string) {
  window.location.hash = path;
}
