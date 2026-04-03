'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

const socials = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/yung-ting-hsieh-b0859a155',
    label: 'in',
  },
  {
    name: 'Google Scholar',
    url: 'https://scholar.google.com.tw/citations?user=TSoiF94AAAAJ',
    label: 'GS',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/dryungtinghsieh-ui',
    label: 'GH',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};


const ctaBaseClass =
  'inline-flex items-center justify-center self-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ease-in-out hover:shadow-[0_0_12px_rgba(59,130,246,0.4)] sm:px-8 sm:py-3 sm:text-base md:self-auto';
const ctaPrimaryClass =
  'bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] text-slate-50';
const ctaSecondaryClass =
  'bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] text-slate-100';
const ctaTertiaryClass =
  'bg-gradient-to-br from-[#1E40AF] to-[#1D4ED8] text-slate-100';
const ctaQuaternaryClass =
  'bg-gradient-to-br from-[#1E3A8A] to-[#1D4ED8] text-slate-100';

const softwareStack = [
  'HFSS',
  'CAD Tools',
  'Python',
  'C',
  'Java',
  'Linux',
  'EDA',
  'CUDA',
  'Ollama',
  'LMStudio',
];

const hardwareStack = [
  'VNA',
  'Oscilloscopes',
  'Lab Instrumentation',
  'NVIDIA GPU (GB/RTX Series)',
];

const timelineEntries = [
  {
    period: 'Present',
    title: 'TE Connectivity',
    subtitle: 'Sr. Signal Integrity Engineer',
    detail:
      'Leading high-speed interconnect modeling and AI-assisted engineering workflows for advanced SI design.',
  },
  {
    period: '2022-2023',
    title: 'TE AI Cup x Rutgers',
    subtitle: 'Best AI Innovation Prize',
    detail:
      'Built AI models for Channel Operating Margin prediction, enabling much faster SI iteration and production-scale impact.',
  },
  {
    period: 'Ph.D. Journey',
    title: 'Rutgers University',
    subtitle: 'ECE Researcher',
    detail:
      'Focused on underwater acoustics, analog/neuromorphic ML systems, and applied AI for sensing and communications.',
  },
  {
    period: 'Earlier Training',
    title: 'Taiwan',
    subtitle: 'Physics -> Engineering Acoustics',
    detail:
      'Built a cross-disciplinary foundation spanning physics, acoustics, devices, and experimental engineering.',
  },
];

function CareerTimeline({
  activeIndex,
  onSelect,
  reduceMotion,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
  reduceMotion: boolean | null;
}) {
  return (
    <div className="w-full rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/70 to-slate-950/80 p-6 shadow-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-blue-300">Timeline</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Career Snapshot</h3>
        </div>
        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
          Interactive
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[170px_1fr]">
        <div className="relative pl-4">
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-gradient-to-b from-blue-500/40 via-cyan-400/30 to-transparent" />
          <div className="space-y-3">
            {timelineEntries.map((entry, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={entry.title}
                  type="button"
                  onClick={() => onSelect(index)}
                  onMouseEnter={() => onSelect(index)}
                  className={`relative w-full text-left transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span
                    className={`absolute -left-[13px] top-1.5 h-3 w-3 rounded-full border ${
                      isActive
                        ? 'border-cyan-300 bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.65)]'
                        : 'border-blue-500/40 bg-slate-950'
                    }`}
                  />
                  <p className="text-[11px] uppercase tracking-[0.22em] text-blue-300/80">
                    {entry.period}
                  </p>
                  <p className={`mt-1 text-sm font-semibold ${isActive ? 'text-cyan-200' : ''}`}>
                    {entry.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
        <motion.div
          key={timelineEntries[activeIndex].title}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="rounded-xl border border-blue-500/20 bg-slate-900/60 p-5"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">
            {timelineEntries[activeIndex].period}
          </p>
          <h4 className="mt-2 text-2xl font-bold text-white">
            {timelineEntries[activeIndex].title}
          </h4>
          <p className="mt-2 text-sm font-medium text-blue-300">
            {timelineEntries[activeIndex].subtitle}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-gray-300">
            {timelineEntries[activeIndex].detail}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [activeTimelineEntry, setActiveTimelineEntry] = useState(0);

  return (
    <main className="min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-black opacity-90" />
        <svg className="absolute inset-0 h-full w-full opacity-10" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {!reduceMotion && (
          <>
            <motion.div
              className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blue-500 opacity-10 blur-3xl"
              animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-500 opacity-10 blur-3xl"
              animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
      </div>

      <div className="relative z-10">
        <section className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.div
            className="w-full max-w-6xl"
            variants={containerVariants}
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
          >
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
              <div className="text-center md:text-left">
                <motion.h1
                  variants={itemVariants}
                  className="mb-6 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl"
                >
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Dr. Yung-Ting Hsieh
                  </span>
                </motion.h1>

                <motion.div variants={itemVariants} className="mb-8 md:hidden">
                  <div className="relative mx-auto h-[460px] w-full max-w-[340px]">
                    {!reduceMotion && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 blur-2xl"
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                    <div className="relative h-full overflow-hidden rounded-2xl border-2 border-blue-500/30 shadow-2xl">
                      <Image
                        src="/me.jpg"
                        alt="Dr. Yung-Ting Hsieh"
                        width={500}
                        height={700}
                        priority
                        className="h-full w-full object-cover object-[42%_center]"
                        style={{ objectPosition: '65% center' }}
                      />
                    </div>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="mb-8 md:hidden">
                  <CareerTimeline
                    activeIndex={activeTimelineEntry}
                    onSelect={setActiveTimelineEntry}
                    reduceMotion={reduceMotion}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="mb-8">
                  <h2 className="mb-2 text-xl font-semibold text-blue-300 sm:text-2xl">
                    Sr. Signal Integrity Engineer
                  </h2>
                  <p className="text-lg font-medium text-cyan-300 sm:text-xl">
                    Physics-Based SI × AI-Enhanced R&D
                  </p>
                </motion.div>

                <motion.p
                  variants={itemVariants}
                  className="mb-12 text-lg leading-relaxed text-gray-300 sm:text-xl"
                >
                  I build high-speed interconnect solutions by combining SI fundamentals, neural modeling, and
                  LLM-assisted engineering workflows.
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="mb-12 rounded-xl border border-blue-500/20 bg-gradient-to-r from-slate-900/50 to-slate-800/50 p-6 backdrop-blur-sm sm:p-8"
                >
                  <p className="text-sm leading-relaxed text-gray-200 sm:text-base">
                    <span className="font-semibold text-cyan-300">Sr. Signal Integrity Engineer at TE Connectivity</span>{' '}
                    with <span className="text-cyan-300">4+ years of advanced Signal Integrity expertise</span> and{' '}
                    <span className="text-cyan-300">7+ years of AI/ML development experience</span>. Specialized in circuit modeling, RAG systems, and Skills/MCP-driven engineering workflows for solving complex high-speed design challenges.
                  </p>
                  <div className="mt-4 grid gap-4 text-xs sm:grid-cols-2 sm:text-sm">
                    <div className="rounded-lg border border-blue-500/20 bg-slate-900/40 p-3">
                      <p className="mb-2 text-blue-300">Software</p>
                      <div className="flex flex-wrap gap-2">
                        {softwareStack.map((tool) => (
                          <span
                            key={tool}
                            className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] text-gray-200 sm:text-xs"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-cyan-500/20 bg-slate-900/40 p-3">
                      <p className="mb-2 text-cyan-300">Hardware</p>
                      <div className="flex flex-wrap gap-2">
                        {hardwareStack.map((tool) => (
                          <span
                            key={tool}
                            className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] text-gray-200 sm:text-xs"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-xs font-mono text-blue-300 sm:text-sm">
                    Using AI to predict advanced SI parameters: 4000x faster iterations, ~4% prediction
                    error, and ~$12.5M estimated savings.
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="mb-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 md:items-start md:justify-start"
                >
                  <motion.a
                    href="/fun/microstrip"
                    whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    className={`${ctaBaseClass} ${ctaSecondaryClass}`}
                  >
                    Microstrip Fun Project
                  </motion.a>
                  <motion.a
                    href="/research"
                    whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    className={`${ctaBaseClass} ${ctaPrimaryClass}`}
                  >
                    View Research Projects
                  </motion.a>
                  {/* Temporarily hidden per request
                  <motion.a
                    href="/cv.pdf"
                    whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    className={`${ctaBaseClass} ${ctaTertiaryClass}`}
                  >
                    Download CV
                  </motion.a>
                  */}
                  <motion.a
                    href="mailto:dr.yungting.hsieh@gmail.com"
                    whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    className={`${ctaBaseClass} ${ctaQuaternaryClass}`}
                  >
                    Contact Me
                  </motion.a>
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-center gap-4 md:justify-start">
                  {socials.map((social) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={reduceMotion ? undefined : { scale: 1.12, y: -2 }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 text-sm font-semibold text-gray-300 transition-colors hover:text-blue-300"
                      title={social.name}
                    >
                      {social.label}
                    </motion.a>
                  ))}
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="hidden md:flex md:flex-col md:items-center md:justify-start">
                <div className="relative -mt-10 h-[640px] w-[500px] max-w-[480px]">
                  {!reduceMotion && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 blur-2xl"
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <div className="relative h-full overflow-hidden rounded-2xl border-2 border-blue-500/30 shadow-2xl">
                    <Image
                      src="/me.jpg"
                      alt="Dr. Yung-Ting Hsieh"
                      width={500}
                      height={700}
                      priority
                      className="h-full w-full object-cover object-[42%_center]"
                      style={{ objectPosition: '65% center' }}
                    />
                  </div>
                </div>
                <div className="mt-6 w-full max-w-[500px]">
                  <CareerTimeline
                    activeIndex={activeTimelineEntry}
                    onSelect={setActiveTimelineEntry}
                    reduceMotion={reduceMotion}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="mb-6 text-2xl font-bold sm:text-3xl">
              Let&apos;s Collaborate on <span className="text-blue-400">Advanced SI & AI Engineering</span>
            </h3>
            <p className="mx-auto mb-8 max-w-2xl text-gray-400">
              Looking to solve high-speed design challenges with physics-based SI engineering, neuromorphic AI,
              and AI-accelerated R&D workflows? Let's talk.
            </p>
            <motion.a
              href="mailto:dr.yungting.hsieh@gmail.com"
              whileHover={reduceMotion ? undefined : { scale: 1.04 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              className="inline-block rounded-lg bg-gradient-to-r from-green-500 to-cyan-500 px-8 py-3 font-semibold text-black transition-all hover:shadow-lg"
            >
              Get In Touch
            </motion.a>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
