'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { researchProjects } from '@/lib/research-data';

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

type CitationState = {
  totalCitations: number;
  fetchedAt: string | null;
  source: string | null;
};

export function ResearchPageClient() {
  const reduceMotion = useReducedMotion();
  const fallbackCitations = useMemo(
    () =>
      researchProjects.reduce(
        (acc, project) =>
          acc +
          (project.publications?.reduce((pubAcc, pub) => pubAcc + (pub.citations || 0), 0) || 0),
        0
      ),
    []
  );

  const [citationState, setCitationState] = useState<CitationState>({
    totalCitations: fallbackCitations,
    fetchedAt: null,
    source: null,
  });
  const [citationFetchFailed, setCitationFetchFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCitations = async () => {
      try {
        const response = await fetch('/api/scholar-citations', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Citation API request failed');
        }

        const data = await response.json();
        if (!isMounted || typeof data.totalCitations !== 'number') {
          return;
        }

        setCitationState({
          totalCitations: data.totalCitations,
          fetchedAt: typeof data.fetchedAt === 'string' ? data.fetchedAt : null,
          source: typeof data.source === 'string' ? data.source : null,
        });
      } catch {
        if (isMounted) {
          setCitationFetchFailed(true);
        }
      }
    };

    fetchCitations();
    return () => {
      isMounted = false;
    };
  }, []);

  const lastCheckedLabel = citationState.fetchedAt
    ? new Date(citationState.fetchedAt).toLocaleString()
    : 'Using local fallback values';

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
        <section className="px-4 pt-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                href="/"
                className="mb-8 inline-flex items-center text-blue-400 transition-colors hover:text-blue-300"
              >
                <span className="mr-2" aria-hidden>
                  &larr;
                </span>
                <span>Back to Home</span>
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-6xl text-center"
            variants={containerVariants}
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="mb-6 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl"
            >
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Research Projects
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mx-auto mb-2 max-w-3xl text-lg text-gray-300 sm:text-xl"
            >
              Pioneering work in AI-assisted signal integrity, hybrid neural networks, and
              neuromorphic computing.
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="mx-auto max-w-2xl text-md text-cyan-300 sm:text-lg"
            >
              Publications in IEEE, ACM, and leading technical conferences.
            </motion.p>
          </motion.div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              className="grid grid-cols-1 gap-8 md:grid-cols-2"
              variants={containerVariants}
              initial={reduceMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {researchProjects.map((project) => (
                <motion.div key={project.id} variants={itemVariants}>
                  <Link href={`/research/${project.id}`} className="block h-full">
                    <motion.div
                      className="group h-full cursor-pointer rounded-xl border border-blue-500/20 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 transition-all duration-300 hover:border-blue-500/50 sm:p-8"
                      whileHover={
                        reduceMotion
                          ? undefined
                          : {
                              borderColor: 'rgba(59, 130, 246, 0.5)',
                              boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)',
                            }
                      }
                    >
                      {project.image && (
                        <div className="relative mb-5 h-48 w-full overflow-hidden rounded-lg border border-blue-500/20 bg-slate-900/60 sm:h-56">
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}

                      <h3 className="mb-4 text-xl font-bold text-blue-300 transition-colors group-hover:text-blue-200 sm:text-2xl">
                        {project.title}
                      </h3>

                      <p className="mb-6 line-clamp-3 text-sm text-gray-300 sm:text-base">
                        {project.shortDescription}
                      </p>

                      <div className="mb-6">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                          Technologies
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 4 && (
                            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                              +{project.technologies.length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {project.achievements && project.achievements.length > 0 && (
                        <div className="mb-6 rounded-lg border-l-2 border-blue-500/50 bg-blue-500/5 p-3">
                          <p className="text-sm text-blue-200">
                            <span className="font-semibold">Key Achievement:</span>{' '}
                            {project.achievements[0]}
                          </p>
                        </div>
                      )}

                      {project.publications && project.publications.length > 0 && (
                        <div className="mb-6">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                            Publications ({project.publications.length})
                          </p>
                          <ul className="space-y-1 text-xs text-gray-400">
                            {project.publications.slice(0, 2).map((pub) => (
                              <li key={pub.title} className="flex items-start">
                                <span className="mr-2 text-blue-400">&bull;</span>
                                <span>
                                  {pub.title} ({pub.year})
                                </span>
                              </li>
                            ))}
                            {project.publications.length > 2 && (
                              <li className="text-blue-400">
                                +{project.publications.length - 2} more publication
                                {project.publications.length > 3 ? 's' : ''}
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {project.references && project.references.length > 0 && (
                        <div className="mb-6">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                            References ({project.references.length})
                          </p>
                          <ul className="space-y-1 text-xs text-gray-400">
                            {project.references.slice(0, 2).map((ref) => (
                              <li key={ref.title} className="flex items-start">
                                <span className="mr-2 text-blue-400">&bull;</span>
                                <span>
                                  {ref.title}
                                  {ref.year ? ` (${ref.year})` : ''}
                                </span>
                              </li>
                            ))}
                            {project.references.length > 2 && (
                              <li className="text-blue-400">
                                +{project.references.length - 2} more reference
                                {project.references.length > 3 ? 's' : ''}
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      <motion.div
                        className="flex items-center text-sm font-semibold text-blue-400 transition-colors group-hover:text-blue-300"
                        whileHover={reduceMotion ? undefined : { x: 4 }}
                      >
                        <span>View Details</span>
                        <span className="ml-2" aria-hidden>
                          &rarr;
                        </span>
                      </motion.div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-transparent via-slate-900/30 to-black px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4"
              variants={containerVariants}
              initial={reduceMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {[
                { label: 'Research Projects', value: researchProjects.length },
                {
                  label: 'Publications',
                  value: researchProjects.reduce((acc, p) => acc + (p.publications?.length || 0), 0),
                },
                { label: 'Patents Filed', value: 2 },
                { label: 'Citations', value: citationState.totalCitations.toLocaleString() },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  className="rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-4 text-center"
                >
                  <p className="mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-400 sm:text-base">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
            <p className="mt-6 text-center text-xs text-gray-500">
              Citation source: {citationState.source ? 'Google Scholar' : 'local project data'}.
              {' '}Last checked: {lastCheckedLabel}
              {citationFetchFailed ? ' (live fetch failed, fallback applied)' : ''}
            </p>
          </div>
        </section>

        <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="mb-6 text-2xl font-bold sm:text-3xl">Interested in Collaboration?</h3>
            <p className="mx-auto mb-8 max-w-2xl text-gray-400">
              Let&apos;s discuss research opportunities, technical partnerships, or AI-driven
              solutions for engineering challenges.
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
