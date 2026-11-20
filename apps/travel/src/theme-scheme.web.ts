import { useSyncExternalStore } from 'react';

function subscribe(listener: () => void): () => void {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  query.addEventListener('change', listener);
  return () => {
    query.removeEventListener('change', listener);
  };
}

function snapshot(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useSystemScheme(): 'dark' | 'light' {
  return useSyncExternalStore(subscribe, snapshot, () => 'light');
}
