'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function StoreHydrator() {
  useEffect(() => {
    let alive = true;
    const finish = () => {
      if (alive) useAuthStore.getState().setHydrated();
    };
    Promise.resolve(useAuthStore.persist.rehydrate()).then(finish);
    return () => {
      alive = false;
    };
  }, []);
  return null;
}