import { researchProjects } from '@/lib/research-data';

// Career totals retained from the existing portfolio; not limited to selected papers.
export function getPortfolioStats(totalCitations: number | null) {
  return [
    { label: 'Research Projects', value: researchProjects.length },
    { label: 'Publications', value: 12 },
    { label: 'Patents Filed', value: 2 },
    { label: 'Citations', value: totalCitations?.toLocaleString() ?? '—' },
  ];
}
