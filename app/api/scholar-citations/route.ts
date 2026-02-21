import { NextResponse } from 'next/server';

export const revalidate = 60 * 60 * 12;

const SCHOLAR_PROFILE_URL =
  'https://scholar.google.com/citations?user=TSoiF94AAAAJ&hl=en';

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

export async function GET() {
  try {
    const response = await fetch(SCHOLAR_PROFILE_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      next: { revalidate },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Google Scholar profile' },
        { status: 502 }
      );
    }

    const html = await response.text();
    const totalCitations = parseTotalCitations(html);

    if (totalCitations === null || Number.isNaN(totalCitations)) {
      return NextResponse.json(
        { error: 'Unable to parse total citations from Google Scholar' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        totalCitations,
        source: SCHOLAR_PROFILE_URL,
        fetchedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 's-maxage=43200, stale-while-revalidate=86400',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Unexpected citation fetch error' }, { status: 500 });
  }
}
