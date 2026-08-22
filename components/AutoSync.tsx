'use client';

import { useEffect } from 'react';
import { useHistoryStore } from '@/lib/store/history-store';
import { useFavoritesStore } from '@/lib/store/favorites-store';
import { useCloudSync } from '@/lib/hooks/useCloudSync';
import { useConfigSync } from '@/lib/hooks/useConfigSync';
import { getSession } from '@/lib/store/auth-store';

// Debounce function to prevent frequent requests
function debounce<Args extends unknown[]>(fn: (...args: Args) => void, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function AutoSync() {
  const { pushToCloud, pullFromCloud } = useCloudSync();

  // Config sync (sources, settings) — works without Redis, file-based
  useConfigSync();

  useEffect(() => {
    const session = getSession();
    if (!session) return; // Skip sync when not logged in

    // 1. Pull the latest data from the cloud once on page load
    pullFromCloud();

    // 2. Watch local data changes and push to the cloud after a 5-second delay
    const debouncedPush = debounce(pushToCloud, 5000);

    // Change point here: Zustand v4/v5 subscribe only accepts a single argument by default
    const unsubHistory = useHistoryStore.subscribe(() => {
      debouncedPush();
    });

    const unsubFavorites = useFavoritesStore.subscribe(() => {
      debouncedPush();
    });

    return () => {
      unsubHistory();
      unsubFavorites();
    };
  }, [pushToCloud, pullFromCloud]);

  return null; // Silent component, no UI to render
}
