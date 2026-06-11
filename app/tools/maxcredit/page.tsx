import type { Metadata } from 'next';

import { MaxCreditPageClient } from './page-client';

export const metadata: Metadata = {
  title: 'MaxCredit',
  description: 'Personal dashboard for tracking premium card statement credits.',
};

export default function MaxCreditPage() {
  return <MaxCreditPageClient />;
}
