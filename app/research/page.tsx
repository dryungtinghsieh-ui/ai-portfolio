import type { Metadata } from 'next';
import { ResearchPageClient } from './research-page-client';

export const metadata: Metadata = {
  title: 'Research Projects',
  description:
    'Research portfolio in AI-assisted signal integrity, hybrid neural networks, neuromorphic systems, and low-power sensing.',
  openGraph: {
    title: 'Research Projects | Dr. Yung-Ting Hsieh',
    description:
      'Research portfolio in AI-assisted signal integrity, hybrid neural networks, neuromorphic systems, and low-power sensing.',
    url: '/research',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research Projects | Dr. Yung-Ting Hsieh',
    description:
      'Research portfolio in AI-assisted signal integrity, hybrid neural networks, neuromorphic systems, and low-power sensing.',
  },
};

export default function ResearchPage() {
  return <ResearchPageClient />;
}
