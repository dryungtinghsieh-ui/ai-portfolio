import { readFileSync, writeFileSync } from 'node:fs';

const SCHOLAR_USER = 'TSoiF94AAAAJ';
const SCHOLAR_URL = `https://scholar.google.com/citations?view_op=list_works&hl=en&user=${SCHOLAR_USER}`;
const DATA_FILE = 'lib/research-data.ts';

function decodeHtml(input) {
  return input
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function parseScholarCitations(html) {
  const map = new Map();
  const rowRegex = /<tr class="gsc_a_tr">([\s\S]*?)<\/tr>/g;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const row = rowMatch[1];
    const idMatch = row.match(/citation_for_view=[^:]+:([A-Za-z0-9_-]+)/);
    if (!idMatch) {
      continue;
    }

    const citationMatch = row.match(/class="gsc_a_ac gs_ibl">(\d*)<\/a>/);
    const citations = citationMatch?.[1] ? Number(citationMatch[1]) : 0;
    map.set(idMatch[1], citations);
  }

  return map;
}

async function fetchScholarHtml() {
  const response = await fetch(SCHOLAR_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; citation-updater/1.0)',
      Accept: 'text/html',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Scholar page: ${response.status}`);
  }

  return response.text();
}

function updateResearchData(content, citationsByScholarId) {
  let updates = 0;
  const citationLineRegex =
    /(citations:\s*)(\d+)(,\s*\r?\n\s*scholarId:\s*'([A-Za-z0-9_-]+)')/g;

  const nextContent = content.replace(
    citationLineRegex,
    (full, prefix, oldValue, suffix, scholarId) => {
      const nextValue = citationsByScholarId.get(String(scholarId));
      if (nextValue === undefined) {
        return full;
      }

      if (Number(oldValue) !== nextValue) {
        updates += 1;
      }

      return `${prefix}${nextValue}${suffix}`;
    }
  );

  return { nextContent, updates };
}

async function main() {
  const html = decodeHtml(await fetchScholarHtml());
  const citationsByScholarId = parseScholarCitations(html);
  const currentContent = readFileSync(DATA_FILE, 'utf8');
  const { nextContent, updates } = updateResearchData(
    currentContent,
    citationsByScholarId
  );

  if (updates === 0) {
    console.log('No citation updates found.');
    return;
  }

  writeFileSync(DATA_FILE, nextContent, 'utf8');
  console.log(`Updated ${updates} citation value(s) in ${DATA_FILE}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
