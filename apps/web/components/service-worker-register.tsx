'use client';

import { useEffect } from 'react';

const CANDIDATE_URLS = ['/sw.js', '/sw'];

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let cancelled = false;

    const register = async () => {
      for (const url of CANDIDATE_URLS) {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          if (!response.ok) {
            continue;
          }

          const registration = await navigator.serviceWorker.register(url, { scope: '/' });
          if (!cancelled && process.env.NODE_ENV !== 'production') {
            console.info(`Service worker registered via ${url}`, registration.scope);
          }

          return;
        } catch (error) {
          if (!cancelled && process.env.NODE_ENV !== 'production') {
            console.warn(`Service worker registration failed for ${url}`, error);
          }
        }
      }
    };

    void register();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
