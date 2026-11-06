# AI Portfolio

Personal website and research portfolio for **Dr. Yung-Ting Hsieh**.

This repository is for maintaining my own site, not an open-source starter template.

## Site Scope

- Personal profile and technical positioning
- Research project showcase and detail pages
- Publication/citation presentation
- Interactive `Microstrip` demo page

## Route Map

- `/` Landing page
- `/research` Research list
- `/research/[id]` Research detail
- `/fun/microstrip` Interactive demo
- `/api/scholar-citations` Citation fetch endpoint

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion

## Structure

```text
app/
  page.tsx
  research/
  fun/microstrip/
  api/scholar-citations/
lib/
  research-data.ts
public/
  research/
  fun/microstrip/
scripts/
  update-scholar-citations.mjs
```

## Citation Sync

All portfolio pages use `CitationProvider`: the homepage total, research statistics,
list previews, and individual publication counts resolve from the same complete
snapshot. Total citations come from the author's Scholar profile, never a sum of
only the papers selected for this portfolio.

- `data/scholar-stats.json` is the last successfully verified snapshot, bundled at
  build time. `/api/scholar-citations` also reads the public snapshot on this
  repository's `main` branch (cached for five minutes), so daily updates do not
  require another website deployment. If GitHub is unavailable or invalid, the
  bundled snapshot remains available. The client retains its newest valid data.
- `fetchedAt` means **successful Scholar fetch**, not API request time. The API
  exposes staleness and reload-failure flags for diagnostics. Visitor pages show
  only statistics and publication counts, without sync timestamps or reload
  controls. Background refresh checks the snapshot; it does not launch a Scholar
  scrape for each visitor.
- Run `pnpm update:citations` (or `node scripts/update-scholar-citations.mjs`) to
  fetch all Scholar pages, validate profile metrics and every portfolio paper,
  and atomically replace the snapshot. No changes are made to research copy or
  publication metadata. `update:scholarly-cache` is a compatibility alias for the
  same updater; Python and `scholarly` are no longer required.
- HTTP/network timeouts and transient errors have bounded retries. Access blocks,
  rate limits, unexpected markup, missing paper counts, and incomplete pagination
  fail explicitly. A failed run leaves the cache and success timestamp unchanged.
  Legitimate Google Scholar count corrections can decrease counts; they are not
  artificially clamped to old values.
- The GitHub workflow runs daily at **10:17 UTC** and can be run manually under
  Actions → Update Scholar Data → Run workflow. It runs the citation tests before
  syncing and commits only the validated JSON. Workflow errors stay failed rather
  than being hidden as successful fallback runs. The updated workflow becomes
  active after it is pushed to `main`.
- Direct Scholar requests can still be blocked upstream. An optional GitHub Actions
  secret `SERPAPI_API_KEY` selects the SerpApi Scholar Author API instead; no key is
  needed for the default path. Never place a provider key in browser code or a
  `NEXT_PUBLIC_*` variable. SerpApi integration is covered by mocked tests; an
  actual provider-account request requires a configured key.
- If a paper is removed or merged on Scholar, update its `scholarId` in
  `lib/research-data.ts`. The updater refuses partial portfolio coverage rather
  than silently replacing an unavailable paper's count with zero.
- Public-repository scheduled workflows can be disabled by GitHub after 60 days
  without repository activity. If syncing stops, inspect Actions, enable the
  workflow if needed, and run it manually. See the GitHub documentation:
  https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows

Validation: `pnpm test:citations` or `node --test tests/citations.test.mjs`.
Tests cover malformed/blocked pages, actual zero citations, multi-page profiles,
request retries, incomplete payloads, atomic writes, and preserving last-good data.

## Maintenance Commands

- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`
- `pnpm update:citations`
