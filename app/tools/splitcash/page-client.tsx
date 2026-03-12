'use client';

import { useEffect } from 'react';
import { getAuth, signInAnonymously } from 'firebase/auth';

import { app } from '@/lib/firebase';

type SplitCashPageClientProps = {
  room?: string;
};

export function SplitCashPageClient({ room }: SplitCashPageClientProps) {
  useEffect(() => {
    const auth = getAuth(app);
    signInAnonymously(auth).catch(console.error);
  }, []);

  const iframeSrc = room
    ? `/tools/splitcash/index.html?room=${encodeURIComponent(room)}`
    : '/tools/splitcash/index.html';

  return (
    <main className="min-h-screen bg-[#161d1b] text-stone-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
        <div className="overflow-hidden">
          <iframe
            title="SplitCash"
            src={iframeSrc}
            loading="eager"
            allowFullScreen
            className="h-[92vh] w-full border-0"
          />
        </div>
      </div>
    </main>
  );
}
