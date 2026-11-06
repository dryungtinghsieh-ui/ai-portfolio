'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCitations } from '@/components/citation-provider';
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

export function ResearchPageClient() {
  const reduceMotion = useReducedMotion();
  const { getPublicationCitations } = useCitations();

  return (
    <main data-palette="graphite" className="portfolio-theme min-h-screen w-full overflow-hidden bg-black text-white">
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

        <section className="px-4 pb-4 pt-12 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-6xl text-center"
            variants={containerVariants}
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl"
            >
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Research Projects
              </span>
            </motion.h1>

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
                            <span className="font-semibold">Selected Result:</span>{' '}
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
                                  {typeof getPublicationCitations(pub.scholarId, pub.citations) ===
                                  'number'
                                    ? ` - Cited by ${getPublicationCitations(pub.scholarId, pub.citations)}`
                                    : ''}
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
                        <span>Read Project</span>
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

      </div>
    </main>
  );
}
