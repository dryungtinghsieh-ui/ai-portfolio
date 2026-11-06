'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { initialCitationSnapshot, normalizeSnapshot, requiredScholarIds, type CitationSnapshot } from '@/lib/citations';

const CitationContext = createContext({
  snapshot: initialCitationSnapshot,
  refreshing: false,
  failed: false,
  refresh: async () => {},
});

export function CitationProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<CitationSnapshot>(initialCitationSnapshot);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);
  const inFlight = useRef(false);
  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    try {
      let next: ReturnType<typeof normalizeSnapshot> = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await fetch('/api/scholar-citations', { cache: 'no-store', signal: AbortSignal.timeout(8000) });
          if (!response.ok) throw new Error('Citation data unavailable');
          const data = await response.json();
          next = normalizeSnapshot(data);
          setFailed(Boolean(data.refreshFailed));
          if (!next || !requiredScholarIds.every(id => Object.hasOwn(next!.citationsByScholarId, id))) throw new Error('Incomplete citation data');
          break;
        } catch {
          if (attempt === 1) throw new Error('Unable to load citation data');
        }
      }
      if (next) {
        setSnapshot(previous => !previous.fetchedAt || Date.parse(next!.fetchedAt) >= Date.parse(previous.fetchedAt) ? next! : previous);
      }
    } catch {
      // Preserve the complete last-known snapshot on every failure.
      setFailed(true);
    } finally {
      setRefreshing(false);
      inFlight.current = false;
    }
  }, []);
  useEffect(() => {
    void refresh();
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(onVisible, 5 * 60 * 1000);
    return () => { document.removeEventListener('visibilitychange', onVisible); window.clearInterval(timer); };
  }, [refresh]);
  return <CitationContext.Provider value={{ snapshot, refreshing, failed, refresh }}>{children}</CitationContext.Provider>;
}

export function useCitations() {
  const context = useContext(CitationContext);
  return {
    ...context,
    getPublicationCitations: (scholarId?: string, fallback?: number) =>
      scholarId && Object.hasOwn(context.snapshot.citationsByScholarId, scholarId)
        ? context.snapshot.citationsByScholarId[scholarId] : fallback,
  };
}
