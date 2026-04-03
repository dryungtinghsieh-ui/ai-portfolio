import { NextResponse } from 'next/server';
import { researchProjects } from '@/lib/research-data';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

export const revalidate = 43200;

const CACHE_FILE_PATH = path.join(process.cwd(), 'data', 'scholar-stats.json');

function getLocalFallback() {
  const citationsByScholarId: Record<string, number> = {};
  let totalCitations = 0;

  for (const project of researchProjects) {
    for (const publication of project.publications ?? []) {
      if (publication.scholarId) {
        const citationValue = publication.citations ?? 0;
        citationsByScholarId[publication.scholarId] = citationValue;
      }
      totalCitations += publication.citations ?? 0;
    }
  }

  return { totalCitations, citationsByScholarId };
}

function normalizeCitationPayload(payload: unknown): {
  totalCitations: number;
  citationsByScholarId: Record<string, number>;
  fetchedAt?: string;
  hindex?: number;
  i10index?: number;
} | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as {
    totalCitations?: unknown;
    citationsByScholarId?: unknown;
    fetchedAt?: unknown;
    hindex?: unknown;
    i10index?: unknown;
  };

  if (
    typeof candidate.totalCitations !== 'number' ||
    !Number.isFinite(candidate.totalCitations) ||
    typeof candidate.citationsByScholarId !== 'object' ||
    candidate.citationsByScholarId === null
  ) {
    return null;
  }

  const citationsByScholarId: Record<string, number> = {};
  for (const [key, value] of Object.entries(candidate.citationsByScholarId)) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      citationsByScholarId[key] = value;
    }
  }

  return {
    totalCitations: candidate.totalCitations,
    citationsByScholarId,
    fetchedAt: typeof candidate.fetchedAt === 'string' ? candidate.fetchedAt : undefined,
    hindex: typeof candidate.hindex === 'number' ? candidate.hindex : undefined,
    i10index: typeof candidate.i10index === 'number' ? candidate.i10index : undefined,
  };
}

async function readCachedScholarlyData(): Promise<{
  totalCitations: number;
  citationsByScholarId: Record<string, number>;
  fetchedAt?: string;
  hindex?: number;
  i10index?: number;
}> {
  const cacheText = await readFile(CACHE_FILE_PATH, 'utf8');
  const parsed = normalizeCitationPayload(JSON.parse(cacheText));
  if (!parsed) {
    throw new Error('Invalid cached scholarly citation payload');
  }
  return parsed;
}

export async function GET() {
  const localFallback = getLocalFallback();

  try {
    const cachedData = await readCachedScholarlyData();
    return NextResponse.json(
      {
        totalCitations: cachedData.totalCitations,
        citationsByScholarId: cachedData.citationsByScholarId,
        hindex: cachedData.hindex ?? null,
        i10index: cachedData.i10index ?? null,
        source: 'scholarly-cache',
        fetchedAt: cachedData.fetchedAt ?? new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 's-maxage=43200, stale-while-revalidate=86400',
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        totalCitations: localFallback.totalCitations,
        citationsByScholarId: localFallback.citationsByScholarId,
        source: 'local-fallback',
        fetchedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 's-maxage=1800, stale-while-revalidate=7200',
        },
      }
    );
  }
}
