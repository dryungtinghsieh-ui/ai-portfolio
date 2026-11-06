import { NextResponse } from 'next/server';
import { initialCitationSnapshot, requiredScholarIds, snapshotIsStale } from '@/lib/citations';
import { readPublishedSnapshot } from '@/lib/citation-cache.mjs';

export const dynamic = 'force-dynamic';
export async function GET() {
  const { snapshot, refreshFailed } = await readPublishedSnapshot(initialCitationSnapshot, requiredScholarIds);
  return NextResponse.json({
    ...snapshot,
    refreshFailed,
    stale: snapshotIsStale(snapshot.fetchedAt),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
