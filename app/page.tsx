'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCitations } from '@/components/citation-provider';
import { getPortfolioStats } from '@/lib/portfolio-stats';

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
  'inline-flex h-full min-h-14 w-full items-center justify-center rounded-xl px-3 py-3 text-center text-xs font-semibold transition-all duration-200 ease-in-out hover:shadow-[0_0_12px_rgba(59,130,246,0.4)] sm:text-sm';
const ctaPrimaryClass =
  'bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] text-slate-50';
const ctaSecondaryClass =
  'bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] text-slate-100';
const ctaQuaternaryClass =
  'bg-gradient-to-br from-[#1E3A8A] to-[#1D4ED8] text-slate-100';

const skillGroups = [
  {
    title: 'Signal Integrity & Modeling',
    skills: ['Ansys HFSS', 'S-Parameters', 'Channel Operating Margin', 'Circuit Modeling'],
  },
  {
    title: 'Measurement & Validation',
    skills: ['VNA', 'Oscilloscopes', 'Simulation–Measurement Correlation'],
  },
  {
    title: 'Machine Learning & Computing',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'CUDA', 'Linux'],
  },
  {
    title: 'LLM Systems & Automation',
    skills: ['RAG', 'LLM Workflows', 'MCP Tool Integration', 'Ollama / LM Studio'],
  },
];

const timelineEntries = [
  {
    period: '2022, 2025-Present',
    title: 'TE Connectivity',
    subtitle: 'Sr. R&D Product/Development Engineer',
    phases: [],
    detail:
      'Develop high-speed interconnects through signal integrity analysis, simulation, and measurement correlation. Build AI-assisted modeling workflows alongside product development. Joined as an SI engineering intern in 2022 and returned in a full-time senior engineering role in 2025.',
  },
  {
    period: '2019-2026',
    title: 'Rutgers University',
    subtitle: 'Ph.D. in Electrical and Computer Engineering',
    phases: [],
    detail:
      'Research in signal processing, underwater acoustic communications, and low-power neural architectures. Served as a Graduate Research Assistant and Teaching Assistant, connecting algorithm development with circuit and system implementation.',
  },
  {
    period: '2017-2018',
    title: 'PAL Acoustics Technology',
    subtitle: 'R&D Engineer',
    phases: [],
    detail:
      'Supported R&D and test workflows for enterprise customers including Dell, HP, Amazon, and Microsoft. Improved test procedures to reduce setup time and support more efficient engineering execution.',
  },
];

const educationJourney = [
  {
    stage: 'HS',
    school: 'TNFSH',
    fullName: 'Tainan First Senior High School',
    major: null,
    website: 'https://www.tnfsh.tn.edu.tw/eng/content/index.aspx?Parser=1,15,151',
    logo: '/Schools/TNFSH_emblem.svg',
    ranking: 'Top 3% Selective',
  },
  {
    stage: 'BS',
    school: 'NCHU',
    fullName: 'National Chung Hsing University',
    major: 'Physics',
    website: 'https://www.phys.nchu.edu.tw/en/',
    logo: '/Schools/National_Chung_Hsing_University_logo.svg',
    ranking: 'Top 6 Taiwan',
  },
  {
    stage: 'MS',
    school: 'NYCU',
    fullName: 'National Yang Ming Chiao Tung University (formerly NCTU)',
    major: 'Audio Engineering',
    website: 'https://robotics.nycu.edu.tw/en/page/index.php?kind=39',
    logo: '/Schools/NCTU_emblem.svg',
    ranking: 'Top 3 Taiwan',
  },
  {
    stage: 'Ph.D.',
    school: 'RU',
    fullName: 'Rutgers University',
    major: 'Electrical & Computer Engineering',
    website: 'https://ece.rutgers.edu/',
    logo: '/Schools/Rutgers_Scarlet_Knights_logo.svg.png',
    ranking: 'Top 40 U.S.',
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
          <p className="text-xs uppercase tracking-[0.24em] text-blue-300">Experience</p>
        </div>
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
                  onFocus={() => onSelect(index)}
                  aria-pressed={isActive}
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
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    {entry.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
        {/* Overlapping grid items reserve the tallest entry at every viewport width.
            Keep inactive entries in layout so hover never moves its own targets. */}
        <div className="grid min-w-0">
          {timelineEntries.map((entry, index) => {
            const isActive = activeIndex === index;
            return (
              <motion.div
                key={entry.title}
                aria-hidden={!isActive}
                inert={!isActive}
                initial={false}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
                className={`col-start-1 row-start-1 min-w-0 rounded-xl border border-blue-500/20 bg-slate-900/60 p-5 ${
                  isActive ? 'visible' : 'invisible pointer-events-none'
                }`}
              >
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">
                  {entry.period}
                </p>
                <h4 className="mt-2 text-2xl font-bold text-white">
                  {entry.title}
                </h4>
                <p className="mt-2 text-sm font-medium text-blue-300">
                  {entry.subtitle}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-gray-300">
                  {entry.detail}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EducationCard({ entry }: { entry: (typeof educationJourney)[number] }) {
  return (
    <a
      href={entry.website}
      target="_blank"
      rel="noopener noreferrer"
      title={`${entry.fullName}${entry.major ? ` · ${entry.major}` : ''} · English website (opens in a new tab)`}
      className="relative flex h-full min-w-0 flex-col items-center rounded-xl border border-blue-500/20 bg-slate-900/60 px-3 py-5 text-center transition-colors hover:border-blue-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300"
    >
      <div className="mb-3 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-white p-2">
        <Image src={entry.logo} alt={entry.fullName} width={52} height={52} className="max-h-12 w-auto object-contain" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{entry.stage}</p>
      <p className="mt-2 text-sm font-semibold leading-snug text-gray-300">{entry.school}<span className="ml-1 text-[10px]" aria-hidden="true">↗</span></p>
      <div className="mt-2 min-h-[4.5rem] w-full">
        {entry.major && <p className="text-xs leading-relaxed text-gray-300">{entry.major}</p>}
      </div>
      <div className="mt-auto w-full pt-3">
        <p className="min-h-8 text-[11px] uppercase leading-4 tracking-[0.12em] text-blue-300/80">{entry.ranking}</p>
      </div>
    </a>
  );
}

function EducationJourney() {
  return (
    <div className="@container w-full rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/70 to-slate-950/80 p-6 shadow-2xl">
      <p className="mb-5 text-xs uppercase tracking-[0.24em] text-blue-300">Education</p>
      <div className="grid auto-rows-fr grid-cols-2 gap-3 @min-[440px]:hidden">
        {[...educationJourney].reverse().map(entry => <EducationCard key={entry.stage} entry={entry} />)}
      </div>
      <div className="hidden auto-rows-fr grid-cols-4 gap-3 @min-[440px]:grid">
        {educationJourney.map(entry => <EducationCard key={entry.stage} entry={entry} />)}
      </div>
      <p className="mt-4 border-t border-blue-500/20 pt-3 text-[11px] leading-relaxed text-gray-400">
        NYCU (formerly NCTU) · Current program: Robotics.
      </p>
    </div>
  );
}

function MiniAiLink() {
  return (
    <a href="/agent" className="group mx-auto mt-4 flex w-full max-w-[480px] items-center gap-4 rounded-xl border border-blue-500/30 bg-slate-900/40 px-5 py-4 text-left transition-colors hover:border-cyan-300">
      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-500/30 text-xl text-cyan-300">✳</span>
      <span className="flex-1"><span className="block text-base font-semibold text-white">Try My Mini AI</span><span className="mt-1 block text-xs leading-relaxed text-gray-400">A little AI experience. Ask a question, explore my work.</span></span>
      <span aria-hidden="true" className="text-lg text-cyan-300">↗</span>
    </a>
  );
}

function ProfileLinks({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div className="mt-6 w-full max-w-[500px]" aria-label="Quick links and social profiles">
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-3 gap-2 sm:gap-3"
      >
        <motion.a
          href="/fun/microstrip"
          whileHover={reduceMotion ? undefined : { scale: 1.04 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          className={`${ctaBaseClass} ${ctaSecondaryClass}`}
        >
          Microstrip Design Tool
        </motion.a>
        <motion.a
          href="/research"
          whileHover={reduceMotion ? undefined : { scale: 1.04 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          className={`${ctaBaseClass} ${ctaPrimaryClass}`}
        >
          Explore Research
        </motion.a>
        <motion.a
          href="mailto:dr.yungting.hsieh@gmail.com"
          whileHover={reduceMotion ? undefined : { scale: 1.04 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          className={`${ctaBaseClass} ${ctaQuaternaryClass}`}
        >
          Get in Touch
        </motion.a>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-5 flex justify-end gap-3">
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
  );
}

export default function Home() {
  const reduceMotion = useReducedMotion();
  const { snapshot: citationSnapshot } = useCitations();
  const [activeTimelineEntry, setActiveTimelineEntry] = useState(0);
  const [palette, setPalette] = useState('graphite');
  const [localPreview, setLocalPreview] = useState(false);
  useEffect(() => {
    if (!['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)) return;
    setLocalPreview(true);
    const selected = new URLSearchParams(window.location.search).get('palette');
    setPalette(['original', 'graphite', 'paper', 'forest'].includes(selected ?? '') ? selected! : 'graphite');
  }, []);
  const paletteOptions = [
    { id: 'graphite', name: '石墨白', note: '炭灰 × 暖白 · 推薦', colors: ['#17191c', '#ece9e2', '#9bb6ce'] },
    { id: 'paper', name: '暖紙墨', note: '米白 × 墨色 × 陶土', colors: ['#f2eee7', '#272923', '#995439'] },
    { id: 'forest', name: '深林綠', note: '深綠 × 柔白 × 鼠尾草', colors: ['#14231f', '#eef0e8', '#b2c6a5'] },
    { id: 'original', name: '目前原版', note: '黑 × 藍青漸層', colors: ['#000000', '#2563eb', '#22d3ee'] },
  ];

  return (
    <>
      {localPreview && (
        <aside className="palette-preview" aria-label="本機配色預覽">
          <div className="palette-intro"><strong>配色實驗室</strong><span>僅本機預覽 · 尚未發布</span></div>
          <div className="palette-options">
            {paletteOptions.map(option => (
              <button key={option.id} type="button" aria-pressed={palette === option.id}
                onClick={() => {
                  setPalette(option.id);
                  const url = new URL(window.location.href);
                  url.searchParams.set('palette', option.id);
                  window.history.replaceState(null, '', url);
                }}>
                <span className="palette-swatches" aria-hidden="true">{option.colors.map(color => <i key={color} style={{ background: color }} />)}</span>
                <span><strong>{option.name}</strong><small>{option.note}</small></span>
              </button>
            ))}
          </div>
        </aside>
      )}
    <main data-palette={palette} className="portfolio-theme min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="portfolio-ambient fixed inset-0 pointer-events-none">
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
        <section className="flex min-h-screen items-start justify-center px-4 pb-12 pt-8 sm:px-6 sm:pt-12 lg:px-8">
          <motion.div
            className="w-full max-w-6xl"
            variants={containerVariants}
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
          >
            <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-12">
              <div className="@container text-center md:text-left">
                <motion.h1
                  variants={itemVariants}
                  className="mb-4 whitespace-nowrap md:mb-6 text-[clamp(1.125rem,8cqw,3rem)] font-black leading-[1.1] tracking-tight"
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
                <div className="mx-auto mb-8 max-w-[340px] md:hidden"><MiniAiLink /></div>
                <motion.div variants={itemVariants} className="mb-8 md:hidden">
                  <CareerTimeline
                    activeIndex={activeTimelineEntry}
                    onSelect={setActiveTimelineEntry}
                    reduceMotion={reduceMotion}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="mb-8">
                  <h2 className="mb-2 text-xl font-semibold text-blue-300 sm:text-2xl">
                    Sr. R&D Product/Development Engineer
                  </h2>
                  <p className="text-lg font-medium text-cyan-300 sm:text-xl">
                    Physics-based modeling and AI for high-speed interconnects.
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="mb-12">
                  <EducationJourney />
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="mb-12 rounded-xl border border-blue-500/20 bg-gradient-to-r from-slate-900/50 to-slate-800/50 p-6 backdrop-blur-sm sm:p-8"
                >
                  <p className="text-sm leading-relaxed text-gray-200 sm:text-base">
                    I&apos;m a <span className="font-semibold text-cyan-300">Sr. R&D Product/Development Engineer at TE Connectivity</span>.
                    {' '}I develop high-speed interconnects through <span className="text-cyan-300">electromagnetic simulation, circuit modeling, and measurement correlation</span>.
                    {' '}Alongside my SI work, I build <span className="text-cyan-300">neural models and LLM-assisted engineering workflows</span> to shorten analysis cycles and make technical knowledge easier to use.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2" aria-label="Technical expertise">
                    {skillGroups.map(group => (
                      <section key={group.title} className="min-w-0 rounded-lg border border-blue-500/20 bg-slate-900/40 p-3">
                        <h3 className="mb-3 text-xs font-semibold leading-relaxed text-blue-300">{group.title}</h3>
                        <ul className="flex flex-wrap gap-1.5" aria-label={group.title}>
                          {group.skills.map(skill => (
                            <li key={skill} className="max-w-full rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] leading-relaxed text-gray-200">
                              {skill}
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-blue-500/20 pt-5 sm:grid-cols-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Research and career statistics">
                    {getPortfolioStats(citationSnapshot.totalCitations).map(stat => (
                      <div key={stat.label} className="flex min-w-0 flex-col gap-1.5">
                        <dt className="order-2 text-[11px] leading-relaxed text-gray-400">{stat.label}</dt>
                        <dd className="text-2xl font-semibold tabular-nums tracking-tight text-white">{stat.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 text-xs font-mono text-blue-300 sm:text-sm">
                    TE Connectivity recognized our team&apos;s COM prediction work with the Best AI Innovation prize
                    at the TE AI Cup 2022–23. Estimated potential testing savings: $12.5M.
                    {' '}<a className="underline underline-offset-4" href="https://ece.rutgers.edu/sites/default/files/2024-06/ECE_Newsletter_2023.pdf#page=6" target="_blank" rel="noopener noreferrer">Award coverage &amp; impact estimate ↗</a>
                  </p>
                </motion.div>


              </div>

              <motion.div variants={itemVariants} className="hidden md:flex md:flex-col md:items-center md:justify-start">
                <div className="relative h-[640px] w-full max-w-[480px]">
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
                <MiniAiLink />
                <div className="mt-6 w-full max-w-[500px]">
                  <CareerTimeline
                    activeIndex={activeTimelineEntry}
                    onSelect={setActiveTimelineEntry}
                    reduceMotion={reduceMotion}
                  />
                </div>
                <ProfileLinks reduceMotion={reduceMotion} />
              </motion.div>
              <div className="w-full max-w-[500px] justify-self-end md:hidden">
                <ProfileLinks reduceMotion={reduceMotion} />
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </main>
    </>
  );
}
