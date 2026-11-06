import { validateCompleteSnapshot } from './citation-model.mjs';

export const PUBLISHED_SNAPSHOT_URL = 'https://raw.githubusercontent.com/dryungtinghsieh-ui/ai-portfolio/main/data/scholar-stats.json';

// Read the published snapshot so scheduled updates do not depend on a redeployment.
// Google Scholar is contacted only by the scheduled updater, never by visitors.
export async function readPublishedSnapshot(bundled, requiredIds, fetchFn = fetch) {
  try {
    const response = await fetchFn(PUBLISHED_SNAPSHOT_URL, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error('Published citation data unavailable');
    const remote = validateCompleteSnapshot(await response.json(), requiredIds);
    const useRemote = !bundled.fetchedAt || Date.parse(remote.fetchedAt) >= Date.parse(bundled.fetchedAt);
    return { snapshot: useRemote ? remote : bundled, refreshFailed: false };
  } catch {
    return { snapshot: bundled, refreshFailed: true };
  }
}
