export const SCHOLAR_AUTHOR_ID = 'TSoiF94AAAAJ';
export const STALE_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const count = value => Number.isSafeInteger(value) && value >= 0;

// Shared by the updater, API and client: malformed data never becomes a zero.
export function normalizeSnapshot(value) {
  if (!record(value) || !count(value.totalCitations) || !record(value.citationsByScholarId)) return null;
  if (value.authorId !== undefined && value.authorId !== SCHOLAR_AUTHOR_ID) return null;
  if (typeof value.fetchedAt !== 'string' || !Number.isFinite(Date.parse(value.fetchedAt))) return null;
  if (Date.parse(value.fetchedAt) > Date.now() + 5 * 60 * 1000) return null;
  const entries = Object.entries(value.citationsByScholarId);
  if (!entries.length || entries.some(([id, n]) => !/^[A-Za-z0-9_-]+$/.test(id) || !count(n))) return null;
  if (entries.reduce((sum, [, n]) => sum + n, 0) > value.totalCitations) return null;
  if (value.hindex != null && !count(value.hindex)) return null;
  if (value.i10index != null && !count(value.i10index)) return null;
  return {
    schemaVersion: 1,
    authorId: SCHOLAR_AUTHOR_ID,
    totalCitations: value.totalCitations,
    hindex: value.hindex ?? null,
    i10index: value.i10index ?? null,
    citationsByScholarId: Object.fromEntries(entries),
    fetchedAt: value.fetchedAt,
    source: value.source === 'serpapi' ? 'serpapi' : 'google-scholar',
  };
}

export function validateCompleteSnapshot(value, requiredIds) {
  const snapshot = normalizeSnapshot(value);
  if (!snapshot) throw new Error('Invalid Scholar snapshot: missing or inconsistent metrics.');
  const missing = requiredIds.filter(id => !Object.hasOwn(snapshot.citationsByScholarId, id));
  if (missing.length) throw new Error(`Incomplete Scholar snapshot: ${missing.length} portfolio publications missing.`);
  return snapshot;
}

export function snapshotIsStale(fetchedAt, now = Date.now()) {
  return !fetchedAt || !Number.isFinite(Date.parse(fetchedAt)) || now - Date.parse(fetchedAt) > STALE_AFTER_MS;
}
