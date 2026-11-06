import type { Metadata } from 'next';
import { ResearchPageClient } from './research-page-client';

export const metadata: Metadata = {
  title: 'Research Projects',
  description:
    'Selected engineering research in signal integrity modeling, low-power neural architectures, and underwater acoustic communications.',
  openGraph: {
    title: 'Research Projects | Dr. Yung-Ting Hsieh',
    description:
      'Selected engineering research in signal integrity modeling, low-power neural architectures, and underwater acoustic communications.',
    url: '/research',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research Projects | Dr. Yung-Ting Hsieh',
    description:
      'Selected engineering research in signal integrity modeling, low-power neural architectures, and underwater acoustic communications.',
  },
};

export default function ResearchPage() {
  return <ResearchPageClient />;
}
