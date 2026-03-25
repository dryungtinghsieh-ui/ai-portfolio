# AI Portfolio

A personal research and engineering portfolio for **Dr. Yung-Ting Hsieh**, built with Next.js App Router.

## Overview

This repo combines two parts in one site:

- Portfolio pages for profile, research highlights, and publication details
- Interactive mini-tools (for example `Microstrip`) served from static HTML/JS apps under `public/`

## Key Features

- Animated landing page with technical focus areas and contact links
- Research index and dynamic project detail pages (`/research/[id]`)
- Citation display with fallback data from local source files
- Google Scholar citation sync via API route and scheduled updater script
- Embedded tool include `Microstrip` (interactive fun project)

## Route Map

- `/` Home page
- `/research` Research project list
- `/research/[id]` Project detail page
- `/fun/microstrip` Microstrip wrapper page (iframe)
- `/api/scholar-citations` Citation fetch endpoint

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion

## Project Structure

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

## Getting Started

### 1) Install dependencies

Preferred (repo already includes `pnpm-lock.yaml`):

```bash
pnpm install
```

Alternative:

```bash
npm install
```

### 2) Run development server

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

- `pnpm dev` Start development server
- `pnpm build` Build for production
- `pnpm start` Start production server
- `pnpm lint` Run ESLint
- `pnpm update:citations` Fetch latest citation counts and update `lib/research-data.ts`

## Citation Data Flow

1. The UI reads baseline publication citation values from `lib/research-data.ts`.
2. `GET /api/scholar-citations` tries to fetch total citations from Google Scholar.
3. If runtime fetch fails, the UI keeps local fallback values.
4. Scheduled updates can refresh local citation values through `scripts/update-scholar-citations.mjs` and the GitHub Action workflow.

## Notes for Maintainers

- No automated test framework is currently configured in this repo.

## Deployment

Deploy as a standard Next.js app (Vercel recommended).
