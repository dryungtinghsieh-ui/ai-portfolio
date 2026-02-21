'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

const expertiseTags = [
  'Signal Integrity',
  'TDR',
  'S-Parameters',
  'Hybrid Neural Networks',
  'Spiking Neural Networks',
  'LLM for Engineering',
  'RAG for Technical Knowledge',
  'AI Agents',
  'Edge AI',
  'Analog AI',
  'Machine Learning',
  'TensorFlow',
  'PyTorch',
  'MEMS Simulation',
];

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

const tagVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: index * 0.04,
      duration: 0.4,
    },
  }),
  hover: {
    scale: 1.05,
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.45)',
    transition: { duration: 0.2 },
  },
};

export default function Home() {
  const [hoveredTag, setHoveredTag] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

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
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="mb-8">
                  <h2 className="mb-2 text-xl font-semibold text-blue-300 sm:text-2xl">
                    AI-Assisted Signal Integrity Engineer
                  </h2>
                  <p className="text-lg font-medium text-cyan-300 sm:text-xl">
                    Analog-Digital Hybrid Neural Networks + LLM-Enhanced R&D
                  </p>
                </motion.div>

                <motion.p
                  variants={itemVariants}
                  className="mb-12 text-lg leading-relaxed text-gray-300 sm:text-xl"
                >
                  I build engineering AI that starts with physics, learns from data, and uses
                  LLMs as a fast research copilot for debugging, design reviews, and technical
                  decision-making.
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="mb-12 rounded-xl border border-blue-500/20 bg-gradient-to-r from-slate-900/50 to-slate-800/50 p-6 backdrop-blur-sm sm:p-8"
                >
                  <p className="text-sm leading-relaxed text-gray-200 sm:text-base">
                    <span className="font-semibold text-cyan-300">Senior R&D Engineer at TE Connectivity</span>{' '}
                    focused on AI-assisted S-parameter prediction, TDR interpretation, and hybrid
                    neural-network systems.
                  </p>
                  <p className="mt-4 text-xs font-mono text-blue-300 sm:text-sm">
                    4000x faster iterations, ~4% prediction error, and ~$12.5M estimated savings.
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="mb-12 flex flex-col justify-center gap-4 sm:flex-row md:justify-start"
                >
                  <motion.a
                    href="/research"
                    whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-3 font-semibold text-black transition-all duration-200 hover:shadow-lg"
                  >
                    View Research Projects
                  </motion.a>
                  <motion.a
                    href="/cv.pdf"
                    whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    className="rounded-lg border border-blue-400/50 px-8 py-3 font-semibold text-blue-300 transition-all duration-200 hover:text-blue-200"
                  >
                    Download CV
                  </motion.a>
                  <motion.a
                    href="mailto:dr.yungting.hsieh@gmail.com"
                    whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    className="rounded-lg border border-green-500/50 px-8 py-3 font-semibold text-green-400 transition-all duration-200 hover:text-green-300"
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

              <motion.div variants={itemVariants} className="hidden justify-center md:flex">
                <div className="relative h-[700px] w-[500px] max-w-[480px]">
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
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section className="bg-gradient-to-b from-black via-slate-900/30 to-black px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.h2
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center text-3xl font-bold sm:text-4xl"
            >
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Technical Expertise
              </span>
            </motion.h2>

            <motion.div
              className="flex flex-wrap justify-center gap-3"
              variants={containerVariants}
              initial={reduceMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {expertiseTags.map((tag, index) => (
                <motion.div
                  key={tag}
                  custom={index}
                  variants={tagVariants}
                  whileHover={reduceMotion ? undefined : 'hover'}
                  onHoverStart={() => setHoveredTag(index)}
                  onHoverEnd={() => setHoveredTag(null)}
                  className={`cursor-pointer rounded-full border px-4 py-2 transition-all duration-200 ${
                    hoveredTag === index
                      ? 'border-blue-400 bg-blue-600/40 text-blue-200'
                      : 'border-blue-500/30 bg-slate-900/40 text-gray-300'
                  }`}
                >
                  {tag}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="mb-6 text-2xl font-bold sm:text-3xl">
              Let&apos;s Collaborate on <span className="text-blue-400">Next-Gen AI Solutions</span>
            </h3>
            <p className="mx-auto mb-8 max-w-2xl text-gray-400">
              Interested in signal integrity, hybrid neural networks, or practical LLM copilots for
              engineering teams?
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
