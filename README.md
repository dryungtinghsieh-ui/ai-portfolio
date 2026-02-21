# AI Portfolio

Personal research portfolio for **Dr. Yung-Ting Hsieh**, built with Next.js App Router.

## Highlights

- Hero profile page with technical focus areas and contact links.
- Research index page with project cards, publication summaries, and citation stats.
- Dynamic project detail pages with per-project metadata for SEO/social sharing.
- Google Scholar citation sync:
  - Runtime API route at `app/api/scholar-citations/route.ts`
  - Scheduled GitHub Action at `.github/workflows/update-citations.yml`
  - Local updater script at `scripts/update-scholar-citations.mjs`

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run start` - Run production server
- `npm run lint` - Run ESLint
- `npm run update:citations` - Pull latest citation counts and update `lib/research-data.ts`

## Citation Data Flow

1. Project pages use local citation values from `lib/research-data.ts` as fallback.
2. `/api/scholar-citations` attempts to fetch total citations from Google Scholar.
3. If API fetch fails, UI keeps fallback values and shows fallback status.
4. Weekly GitHub Action updates local citation values automatically.

## Deployment

Deploy as a standard Next.js application (Vercel recommended).
