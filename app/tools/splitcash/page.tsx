import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SplitCash',
  description: 'Private shared expense tracker for friends.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SplitCashPage() {
  return (
    <main className="min-h-screen bg-[#161d1b] text-stone-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">SplitCash</h1>
            <p className="text-sm text-stone-300">Private shared expense tool</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-2xl">
          <iframe
            title="SplitCash"
            src="/tools/splitcash/index.html"
            loading="eager"
            allowFullScreen
            className="h-[92vh] w-full border-0"
          />
        </div>
      </div>
    </main>
  );
}
