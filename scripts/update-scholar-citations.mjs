import { readFile, writeFile, rename, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCHOLAR_AUTHOR_ID, validateCompleteSnapshot } from '../lib/citation-model.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const strip = text => text.replace(/<[^>]*>/g, '').replace(/&nbsp;|&#160;|&#8239;/g, ' ').trim();
const hasClass = (attrs, token) => {
  const classes = attrs.match(/\bclass\s*=\s*["']([^"']*)["']/i)?.[1] ?? '';
  return classes.split(/\s+/).includes(token);
};
function numeric(text) {
  const value = strip(text).replace(/[,\s\u00a0\u202f]/g, '');
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error('Unrecognized citation count.');
  return Number(value);
}

export function parseScholarPage(html, authorId = SCHOLAR_AUTHOR_ID) {
  if (/\/sorry\/|unusual traffic|not a robot|captcha/i.test(strip(html))) throw new Error('Google Scholar blocked the request.');
  const metricsTable = html.match(/<table\b[^>]*\bid=["']gsc_rsb_st["'][^>]*>([\s\S]*?)<\/table>/i)?.[1];
  const metrics = {};
  if (metricsTable) {
    for (const row of metricsTable.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...row[1].matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)];
      const label = strip(cells[0]?.[2] ?? '').toLowerCase();
      const key = { citations: 'totalCitations', 'h-index': 'hindex', 'i10-index': 'i10index' }[label];
      if (key) metrics[key] = numeric(cells.find(cell => hasClass(cell[1], 'gsc_rsb_std'))?.[2] ?? '');
    }
    if (['totalCitations', 'hindex', 'i10index'].some(key => metrics[key] === undefined)) throw new Error('Missing Scholar profile metrics.');
  }
  const articles = {};
  for (const match of html.matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi)) {
    if (!hasClass(match[1], 'gsc_a_tr')) continue;
    const id = match[2].match(/citation_for_view=([^&"'<>\s]+)/)?.[1];
    const fullId = id ? decodeURIComponent(id) : '';
    if (!fullId.startsWith(`${authorId}:`)) throw new Error('Missing or mismatched Scholar publication ID.');
    const scholarId = fullId.slice(authorId.length + 1);
    const citationCell = [...match[2].matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)].find(cell => hasClass(cell[1], 'gsc_a_c'));
    if (!citationCell) throw new Error('Missing publication citation cell.');
    const link = [...citationCell[2].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].find(a => hasClass(a[1], 'gsc_a_ac'));
    if (!link) throw new Error('Missing publication citation link.');
    // Scholar represents a verified zero by an empty citation anchor.
    const citations = strip(link[2]) === '' ? 0 : numeric(link[2]);
    if (Object.hasOwn(articles, scholarId)) throw new Error('Duplicate Scholar publication ID.');
    articles[scholarId] = citations;
  }
  const more = html.match(/<button\b(?=[^>]*\bid=["']gsc_bpf_more["'])[^>]*>/i)?.[0];
  if (!more) throw new Error('Missing Scholar pagination marker.');
  return { metrics, articles, hasMore: !/\sdisabled(?:\s|=|>)/i.test(more) };
}

export async function fetchWithRetry(url, { fetchFn = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), attempts = 3 } = {}) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetchFn(url, { signal: AbortSignal.timeout(20000), headers: { Accept: 'text/html, application/json', 'User-Agent': 'portfolio-citation-sync/2.0' } });
      if (!response.ok) {
        const error = new Error(`Citation source returned HTTP ${response.status}.`);
        error.retryable = response.status >= 500;
        throw error;
      }
      return response;
    } catch (error) {
      // Do not retry access blocks/rate limits or expose URLs containing API keys.
      if (error.retryable === false || attempt === attempts - 1) throw new Error(error.message?.startsWith('Citation source returned HTTP') ? error.message : 'Citation source request failed or timed out.');
      await sleep(1000 * 2 ** attempt);
    }
  }
}

export async function fetchGoogleScholar(options = {}) {
  const citationsByScholarId = {};
  let metrics;
  for (let page = 0; page < 20; page++) {
    const url = new URL('https://scholar.google.com/citations');
    url.search = new URLSearchParams({ user: SCHOLAR_AUTHOR_ID, hl: 'en', cstart: String(page * 100), pagesize: '100' }).toString();
    const parsed = parseScholarPage(await (await fetchWithRetry(url, options)).text());
    if (page === 0) {
      metrics = parsed.metrics;
      if (metrics.totalCitations === undefined) throw new Error('Missing profile-wide citation total.');
    }
    for (const [id, n] of Object.entries(parsed.articles)) {
      if (Object.hasOwn(citationsByScholarId, id)) throw new Error('Repeated Scholar pagination results.');
      citationsByScholarId[id] = n;
    }
    if (!parsed.hasMore) return { ...metrics, citationsByScholarId, source: 'google-scholar' };
    if (Object.keys(parsed.articles).length !== 100) throw new Error('Incomplete Scholar page.');
  }
  throw new Error('Scholar pagination limit reached.');
}

export async function fetchSerpApi(apiKey, options = {}) {
  let metrics;
  const citationsByScholarId = {};
  for (let page = 0; page < 20; page++) {
    const url = new URL('https://serpapi.com/search.json');
    url.search = new URLSearchParams({ engine: 'google_scholar_author', author_id: SCHOLAR_AUTHOR_ID, hl: 'en', start: String(page * 100), num: '100', api_key: apiKey }).toString();
    const data = await (await fetchWithRetry(url, options)).json();
    if (data.error) throw new Error('SerpApi could not return Scholar data.');
    if (page === 0) {
      const table = data.cited_by?.table;
      metrics = { totalCitations: table?.find(row => row.citations)?.citations?.all, hindex: table?.find(row => row.h_index)?.h_index?.all, i10index: table?.find(row => row.i10_index)?.i10_index?.all };
      if (Object.values(metrics).some(n => !Number.isSafeInteger(n) || n < 0)) throw new Error('Missing SerpApi profile metrics.');
    }
    if (!Array.isArray(data.articles)) throw new Error('Missing SerpApi articles.');
    for (const article of data.articles) {
      if (!article.citation_id?.startsWith(`${SCHOLAR_AUTHOR_ID}:`)) throw new Error('Mismatched SerpApi author.');
      const id = article.citation_id.split(':')[1];
      // Missing values are errors, not zeros.
      const n = article.cited_by?.value;
      if (!Number.isSafeInteger(n) || n < 0 || Object.hasOwn(citationsByScholarId, id)) throw new Error('Invalid SerpApi article count.');
      citationsByScholarId[id] = n;
    }
    if (!data.serpapi_pagination?.next && !data.serpapi_pagination?.next_link) return { ...metrics, citationsByScholarId, source: 'serpapi' };
  }
  throw new Error('SerpApi pagination limit reached.');
}

export async function updateCitations({ root = ROOT, fetchFn = fetch, apiKey = process.env.SERPAPI_API_KEY, sleep, now = () => new Date() } = {}) {
  const content = await readFile(path.join(root, 'lib/research-data.ts'), 'utf8');
  const requiredIds = [...new Set([...content.matchAll(/\bscholarId:\s*['"]([A-Za-z0-9_-]+)['"]/g)].map(m => m[1]))];
  if (!requiredIds.length) throw new Error('No portfolio publication IDs found.');
  const payload = apiKey ? await fetchSerpApi(apiKey, { fetchFn, sleep }) : await fetchGoogleScholar({ fetchFn, sleep });
  const snapshot = validateCompleteSnapshot({ ...payload, authorId: SCHOLAR_AUTHOR_ID, fetchedAt: now().toISOString() }, requiredIds);
  const target = path.join(root, 'data/scholar-stats.json');
  const temporary = `${target}.${process.pid}.tmp`;
  await mkdir(path.dirname(target), { recursive: true });
  try {
    await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    await rename(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
  return snapshot;
}

export async function main() {
  try {
    const snapshot = await updateCitations();
    console.log(`Updated Scholar snapshot: ${snapshot.totalCitations} citations, ${Object.keys(snapshot.citationsByScholarId).length} publications; ${snapshot.fetchedAt} (${snapshot.source}).`);
  } catch (error) {
    console.error(`Citation sync failed; last successful snapshot kept. ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
