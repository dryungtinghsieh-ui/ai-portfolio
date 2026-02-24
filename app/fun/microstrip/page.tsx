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
        <h1 className="text-lg font-semibold">Microstrip Fun Project (Test Route)</h1>
        <p className="text-sm text-slate-300">
          Hidden route for testing only. This page is not linked from the main site.
        </p>
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
          <iframe
            title="Microstrip Designer"
            src="/fun/microstrip/index.html"
            className="h-[85vh] w-full border-0"
          />
        </div>
      </div>
    </main>
  );
}
