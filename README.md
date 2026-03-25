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

## Citation Sync Notes

1. Baseline citation data is stored in `lib/research-data.ts`.
2. `GET /api/scholar-citations` fetches total citations from Google Scholar at runtime.
3. If fetch/parsing fails, UI falls back to local data.
4. `scripts/update-scholar-citations.mjs` is used for scheduled/local refresh.

## Maintenance Commands

- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`
- `pnpm update:citations`
