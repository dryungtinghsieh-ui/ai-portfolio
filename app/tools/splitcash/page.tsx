import type { Metadata } from 'next';

import { SplitCashPageClient } from './page-client';

export const metadata: Metadata = {
  title: 'SplitCash',
  description: 'Private shared expense tracker for friends.',
  robots: {
    index: false,
    follow: false,
  },
};

type SplitCashPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SplitCashPage({ searchParams }: SplitCashPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const roomParam = resolvedSearchParams?.room;
  const room = Array.isArray(roomParam) ? roomParam[0] : roomParam;

  return <SplitCashPageClient room={room} />;
}
