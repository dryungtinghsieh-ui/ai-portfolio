import { NextResponse } from 'next/server';
import { researchProjects } from '@/lib/research-data';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

export const revalidate = 43200;

const SCHOLAR_USER_ID = 'TSoiF94AAAAJ';
const execFileAsync = promisify(execFile);
const PROFILE_URLS = [
  `https://scholar.google.com/citations?user=${SCHOLAR_USER_ID}&hl=en`,
  `https://scholar.google.com.tw/citations?user=${SCHOLAR_USER_ID}&hl=en`,
];
const WORKS_URLS = [
  `https://scholar.google.com/citations?view_op=list_works&hl=en&user=${SCHOLAR_USER_ID}&cstart=0&pagesize=100`,
  `https://scholar.google.com.tw/citations?view_op=list_works&hl=en&user=${SCHOLAR_USER_ID}&cstart=0&pagesize=100`,
];

function parseTotalCitations(html: string): number | null {
  const byId = html.match(
    /id="gsc_rsb_st"[\s\S]*?<td class="gsc_rsb_std">([\d,]+)<\/td>/i
  );
  if (byId?.[1]) {
    return Number(byId[1].replace(/,/g, ''));
  }

  const byLabel = html.match(/Cited by<\/a><\/td>\s*<td class="gsc_rsb_std">([\d,]+)</i);
  if (byLabel?.[1]) {
    return Number(byLabel[1].replace(/,/g, ''));
  }

  return null;
}

function parseCitationsByScholarId(html: string): Record<string, number> {
  const result: Record<string, number> = {};
  const rowRegex = /<tr class="gsc_a_tr">([\s\S]*?)<\/tr>/g;
  let rowMatch: RegExpExecArray | null = rowRegex.exec(html);

  while (rowMatch !== null) {
    const row = rowMatch[1];
    const scholarIdMatch = row.match(/citation_for_view=[^:]+:([A-Za-z0-9_-]+)/);
    if (scholarIdMatch?.[1]) {
      const citationMatch = row.match(/class="gsc_a_ac gs_ibl">(\d*)<\/a>/);
      const citationValue = citationMatch?.[1] ? Number(citationMatch[1]) : 0;
      result[scholarIdMatch[1]] = Number.isFinite(citationValue) ? citationValue : 0;
    }
    rowMatch = rowRegex.exec(html);
  }

  return result;
}

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
} | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as {
    totalCitations?: unknown;
    citationsByScholarId?: unknown;
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
  };
}

async function fetchByScholarly(): Promise<{
  totalCitations: number;
  citationsByScholarId: Record<string, number>;
}> {
  const pythonCommands = process.env.SCHOLARLY_PYTHON_PATH
    ? [process.env.SCHOLARLY_PYTHON_PATH]
    : ['python3', 'python'];
  const scriptPath = path.join(process.cwd(), 'scripts', 'fetch-scholarly-citations.py');
  let lastError: unknown;

  for (const pythonCommand of pythonCommands) {
    try {
      const { stdout } = await execFileAsync(pythonCommand, [scriptPath, SCHOLAR_USER_ID], {
        cwd: process.cwd(),
        timeout: 15000,
        maxBuffer: 1024 * 1024,
      });

      const parsed = normalizeCitationPayload(JSON.parse(stdout));
      if (!parsed) {
        throw new Error('Invalid scholarly citation payload');
      }

      return parsed;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Unable to run scholarly fetch');
}

async function fetchTextWithTimeout(url: string, timeoutMs = 12000): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      next: { revalidate },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFromAny(urls: string[]): Promise<string> {
  let lastError: unknown;
  for (const url of urls) {
    try {
      return await fetchTextWithTimeout(url);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('All citation sources failed');
}

export async function GET() {
  const localFallback = getLocalFallback();

  try {
    const scholarlyData = await fetchByScholarly();
    return NextResponse.json(
      {
        totalCitations: scholarlyData.totalCitations,
        citationsByScholarId: scholarlyData.citationsByScholarId,
        source: 'scholarly-live',
        fetchedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 's-maxage=43200, stale-while-revalidate=86400',
        },
      }
    );
  } catch {
    // Fall back to direct HTML parsing when scholarly is unavailable.
  }

  try {
    const [profileHtml, worksHtml] = await Promise.all([
      fetchFromAny(PROFILE_URLS),
      fetchFromAny(WORKS_URLS),
    ]);

    const totalCitations = parseTotalCitations(profileHtml);
    const citationsByScholarId = parseCitationsByScholarId(worksHtml);

    if (totalCitations === null || Number.isNaN(totalCitations)) {
      throw new Error('Unable to parse total citations from Google Scholar');
    }

    return NextResponse.json(
      {
        totalCitations,
        citationsByScholarId,
        source: 'google-scholar-live',
        fetchedAt: new Date().toISOString(),
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
