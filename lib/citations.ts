import savedSnapshot from '@/data/scholar-stats.json';
import { researchProjects } from '@/lib/research-data';
import { normalizeSnapshot, snapshotIsStale } from '@/lib/citation-model.mjs';

export type CitationSnapshot = {
  totalCitations: number | null;
  citationsByScholarId: Record<string, number>;
  fetchedAt: string | null;
  hindex: number | null;
  i10index: number | null;
  source: string;
};
const publicationCounts: Record<string, number> = {};
for (const project of researchProjects) {
  for (const pub of project.publications ?? []) {
    if (pub.scholarId && Number.isSafeInteger(pub.citations) && (pub.citations ?? -1) >= 0) {
      publicationCounts[pub.scholarId] = pub.citations!;
    }
  }
}
export const requiredScholarIds = Object.keys(publicationCounts);
const normalized = normalizeSnapshot(savedSnapshot);
const complete = normalized && Object.keys(publicationCounts).every(id => Object.hasOwn(normalized.citationsByScholarId, id));
export const initialCitationSnapshot: CitationSnapshot = complete ? normalized : {
  // A sum of selected papers is not the author's profile-wide total.
  totalCitations: null,
  citationsByScholarId: publicationCounts,
  fetchedAt: null,
  hindex: null,
  i10index: null,
  source: 'local-fallback',
};
export { normalizeSnapshot, snapshotIsStale };
