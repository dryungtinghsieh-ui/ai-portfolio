export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-10">
      <h1 className="text-5xl font-bold mb-4">
        Yung-Ting Hsieh
      </h1>

      <h2 className="text-2xl text-gray-400 mb-6">
        PhD ECE @ Rutgers | Signal Integrity Engineer @ TE Connectivity
      </h2>

      <p className="text-lg max-w-2xl text-center text-gray-300 mb-8">
        I specialize in AI-assisted Signal Integrity Modeling,
        Analog-Digital Hybrid Neural Networks, and Energy-Efficient Edge AI Systems.
      </p>

      <div className="flex gap-4">
        <a
          href="https://www.linkedin.com/in/yung-ting-hsieh-b0859a155"
          target="_blank"
          className="px-6 py-2 border rounded hover:bg-white hover:text-black"
        >
          LinkedIn
        </a>

        <a
          href="https://scholar.google.com.tw/citations?user=TSoiF94AAAAJ"
          target="_blank"
          className="px-6 py-2 border rounded hover:bg-white hover:text-black"
        >
          Google Scholar
        </a>
      </div>
    </main>
  );
}
