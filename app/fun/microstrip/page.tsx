import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Microstrip Designer (Hidden)',
  description: 'Internal test page for the microstrip fun project.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MicrostripFunPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold">Microstrip Fun Project (Test Route)</h1>
          <a
            href="/"
            className="rounded-lg border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400 hover:text-cyan-200"
          >
            Back to Home
          </a>
        </div>
        <p className="text-sm text-slate-300">
          Hidden route for testing only. This page is not linked from the main site.
        </p>
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
          <iframe
            title="Microstrip Designer"
            src="/fun/microstrip/index.html"
            loading="eager"
            allowFullScreen
            className="h-[85vh] w-full border-0"
          />
        </div>
      </div>
    </main>
  );
}
