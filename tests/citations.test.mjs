import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { normalizeSnapshot, validateCompleteSnapshot, snapshotIsStale, SCHOLAR_AUTHOR_ID } from '../lib/citation-model.mjs';
import { readPublishedSnapshot } from '../lib/citation-cache.mjs';
import { parseScholarPage, fetchGoogleScholar, fetchSerpApi, fetchWithRetry, updateCitations } from '../scripts/update-scholar-citations.mjs';

const snapshot = (overrides = {}) => ({ authorId: SCHOLAR_AUTHOR_ID, totalCitations: 127, hindex: 7, i10index: 7, citationsByScholarId: { paperA: 25, paperB: 0 }, fetchedAt: '2026-01-01T00:00:00.000Z', ...overrides });
const metrics = `<table id='gsc_rsb_st'><tr><td>Citations</td><td class='extra gsc_rsb_std'>1,234</td><td class='gsc_rsb_std'>900</td></tr><tr><td>h-index</td><td class='gsc_rsb_std'>7</td><td class='gsc_rsb_std'>6</td></tr><tr><td>i10-index</td><td class='gsc_rsb_std'>7</td><td class='gsc_rsb_std'>6</td></tr></table>`;
const row = (id, count) => `<tr data-row='1' class='extra gsc_a_tr'><td class='gsc_a_t'><a href='/citations?citation_for_view=${SCHOLAR_AUTHOR_ID}%3A${id}&amp;hl=en'>Paper</a></td><td class='gsc_a_c'><a data-x='1' class='gs_ibl gsc_a_ac'>${count}</a></td></tr>`;
const html = (rows = row('paperA', '25') + row('paperB', ''), more = false, withMetrics = true) => `${withMetrics ? metrics : ''}<table>${rows}</table><button class='more' id='gsc_bpf_more' ${more ? '' : 'disabled'}>Show more</button>`;
const response = body => ({ ok: true, text: async () => body, json: async () => body });

test('validates integers, author identity, dates, array payloads and profile-wide total', () => {
  assert.equal(normalizeSnapshot(snapshot()).totalCitations, 127);
  for (const invalid of [
    { totalCitations: -1 }, { totalCitations: 1.5 }, { totalCitations: '127' },
    { citationsByScholarId: [] }, { citationsByScholarId: { paperA: -1 } },
    { citationsByScholarId: { paperA: null } }, { citationsByScholarId: { paperA: 1.2 } },
    { citationsByScholarId: { paperA: 128 } }, { citationsByScholarId: {} },
    { fetchedAt: 'not-a-date' }, { fetchedAt: null }, { fetchedAt: '2999-01-01T00:00:00Z' },
    { authorId: 'someone-else' }, { hindex: -1 },
  ]) assert.equal(normalizeSnapshot(snapshot(invalid)), null, JSON.stringify(invalid));
  assert.throws(() => validateCompleteSnapshot(snapshot(), ['missing']), /missing/);
});

test('missing or old timestamps are stale; no fabricated success timestamp', () => {
  assert.equal(snapshotIsStale(null), true);
  assert.equal(snapshotIsStale('bad'), true);
  assert.equal(snapshotIsStale('2026-01-01T00:00:00Z', Date.parse('2026-01-05T00:00:00Z')), true);
  assert.equal(snapshotIsStale('2026-01-01T00:00:00Z', Date.parse('2026-01-02T00:00:00Z')), false);
});

test('parses reordered attributes/classes, escaped IDs, thousands and actual zeros', () => {
  const result = parseScholarPage(html());
  assert.deepEqual(result.metrics, { totalCitations: 1234, hindex: 7, i10index: 7 });
  assert.deepEqual(result.articles, { paperA: 25, paperB: 0 });
  assert.equal(result.hasMore, false);
  assert.equal(parseScholarPage(html('', true)).hasMore, true);
});

test('blocked, missing, changed or malformed counts never silently become zero', () => {
  for (const body of [
    '<html>unusual traffic captcha</html>',
    html().replace("class='gs_ibl gsc_a_ac'", "class='changed'"),
    html(row('paperA', 'not available')),
    html(row('paperA', '25') + row('paperA', '25')),
    html().replace('gsc_bpf_more', 'missing-pagination'),
    html().replace('>1,234<', '>unknown<'),
    html().replace(`${SCHOLAR_AUTHOR_ID}%3A`, 'wrong-author%3A'),
  ]) assert.throws(() => parseScholarPage(body));
});

test('collects every page and rejects repeated/partial pagination', async () => {
  let calls = 0;
  const result = await fetchGoogleScholar({ fetchFn: async url => {
    assert.equal(new URL(url).searchParams.get('cstart'), String(calls * 100));
    return response(calls++ === 0 ? html(Array.from({ length: 100 }, (_, i) => row(`p${i}`, '1')).join(''), true) : html(row('last', '2'), false, false));
  }});
  assert.equal(Object.keys(result.citationsByScholarId).length, 101);
  assert.equal(result.citationsByScholarId.last, 2);
  assert.equal(result.totalCitations, 1234);
  await assert.rejects(fetchGoogleScholar({ fetchFn: async () => response(html(row('partial', '2'), true)) }), /Incomplete/);
});

test('bounded retries for transient errors, no retries on access block/rate limit', async () => {
  let calls = 0;
  const waits = [];
  await fetchWithRetry('https://example.com', { sleep: async n => waits.push(n), fetchFn: async () => {
    if (++calls < 3) throw new Error('socket failure');
    return response('ok');
  }});
  assert.equal(calls, 3);
  assert.deepEqual(waits, [1000, 2000]);
  for (const status of [403, 429]) {
    calls = 0;
    await assert.rejects(fetchWithRetry('https://example.com', { fetchFn: async () => { calls++; return { ok: false, status }; } }), new RegExp(String(status)));
    assert.equal(calls, 1);
  }
});

test('optional SerpApi path validates profile metrics and every article', async () => {
  const data = { cited_by: { table: [{ citations: { all: 127 } }, { h_index: { all: 7 } }, { i10_index: { all: 7 } }] }, articles: [{ citation_id: `${SCHOLAR_AUTHOR_ID}:paperA`, cited_by: { value: 25 } }] };
  const parsed = await fetchSerpApi('test-only-key', { fetchFn: async () => response(data) });
  assert.equal(parsed.totalCitations, 127);
  assert.equal(parsed.source, 'serpapi');
  await assert.rejects(fetchSerpApi('test-only-key', { fetchFn: async () => response({ ...data, articles: [{ citation_id: `${SCHOLAR_AUTHOR_ID}:paperA` }] }) }), /count/);
});

test('failed sync leaves last-good cache byte-for-byte unchanged; success writes all data atomically', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'portfolio-citations-'));
  try {
    await mkdir(path.join(root, 'lib')); await mkdir(path.join(root, 'data'));
    await writeFile(path.join(root, 'lib/research-data.ts'), "scholarId: 'paperA', scholarId: 'paperB'");
    const file = path.join(root, 'data/scholar-stats.json');
    const previous = JSON.stringify(snapshot(), null, 2);
    await writeFile(file, previous);
    for (const body of ['<html>captcha</html>', html(row('paperA', '25'))]) {
      await assert.rejects(updateCitations({ root, apiKey: '', fetchFn: async () => response(body) }));
      assert.equal(await readFile(file, 'utf8'), previous);
    }
    const updated = await updateCitations({ root, apiKey: '', fetchFn: async () => response(html()), now: () => new Date('2026-02-01T00:00:00Z') });
    assert.equal(updated.totalCitations, 1234);
    assert.deepEqual(updated.citationsByScholarId, { paperA: 25, paperB: 0 });
    assert.equal(updated.fetchedAt, '2026-02-01T00:00:00.000Z');
    assert.deepEqual(await readdir(path.join(root, 'data')), ['scholar-stats.json']);
    assert.equal((await readFile(path.join(root, 'lib/research-data.ts'), 'utf8')), "scholarId: 'paperA', scholarId: 'paperB'");
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('API selects newer complete snapshot, keeps bundled cache on invalid/missing/older remote data', async () => {
  const bundled = snapshot();
  const newer = snapshot({ totalCitations: 130, fetchedAt: '2026-02-01T00:00:00Z' });
  assert.equal((await readPublishedSnapshot(bundled, ['paperA', 'paperB'], async () => response(newer))).snapshot.totalCitations, 130);
  for (const remote of [snapshot({ fetchedAt: '2025-01-01T00:00:00Z' }), snapshot({ citationsByScholarId: { paperA: 25 } }), snapshot({ totalCitations: 0 })]) {
    assert.equal((await readPublishedSnapshot(bundled, ['paperA', 'paperB'], async () => response(remote))).snapshot, bundled);
  }
  const unavailable = await readPublishedSnapshot(bundled, ['paperA'], async () => { throw new Error('offline'); });
  assert.equal(unavailable.refreshFailed, true);
  assert.equal(unavailable.snapshot.fetchedAt, bundled.fetchedAt);
});
