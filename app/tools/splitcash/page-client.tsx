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
    <main className="min-h-[100dvh] bg-[#161d1b] text-stone-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-0 py-0 sm:px-6 sm:py-4">
        <div className="overflow-hidden sm:rounded-[28px]">
          <iframe
            title="SplitCash"
            src={iframeSrc}
            loading="eager"
            allowFullScreen
            className="h-[100dvh] w-full border-0 sm:h-[92vh]"
          />
        </div>
      </div>
    </main>
  );
}
