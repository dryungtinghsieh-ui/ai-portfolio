'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ResearchProject, researchProjects } from '@/lib/research-data';

interface ProjectDetailClientProps {
  project: ResearchProject;
}

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

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-black opacity-90" />
        <svg className="absolute inset-0 h-full w-full opacity-5" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(59, 130, 246, 0.1)"
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
        <section className="border-b border-blue-500/10 px-4 pt-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl pb-8">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between"
            >
              <Link
                href="/research"
                className="inline-flex items-center text-blue-400 transition-colors hover:text-blue-300"
              >
                <span className="mr-2" aria-hidden>
                  &larr;
                </span>
                <span>Back to Projects</span>
              </Link>
              <Link href="/" className="text-sm text-gray-400 transition-colors hover:text-blue-300">
                Home
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
              variants={itemVariants}
            >
              <h1 className="mb-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {project.title}
                </span>
              </h1>

              <p className="mb-12 text-lg font-medium text-cyan-300 sm:text-xl">
                {project.shortDescription}
              </p>

              {project.image && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="mb-12 rounded-xl border border-blue-500/20 bg-slate-900/30 p-4"
                >
                  <div className="relative h-96 w-full overflow-hidden rounded-lg sm:h-[500px]">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
              variants={itemVariants}
              className="mb-12 rounded-xl border border-blue-500/20 bg-gradient-to-r from-slate-900/50 to-slate-800/50 p-6 sm:p-8"
            >
              <h2 className="mb-4 text-xl font-bold text-blue-300 sm:text-2xl">Overview</h2>
              <p className="text-base leading-relaxed text-gray-300 sm:text-lg">{project.fullDescription}</p>
            </motion.div>

            {project.impact && (
              <motion.div
                initial={reduceMotion ? false : 'hidden'}
                animate="visible"
                variants={itemVariants}
                className="mb-12 rounded-xl border border-green-500/20 bg-gradient-to-r from-green-900/20 to-cyan-900/20 p-6 sm:p-8"
              >
                <h2 className="mb-4 text-xl font-bold text-green-400 sm:text-2xl">Real-World Impact</h2>
                <p className="text-base leading-relaxed text-gray-300 sm:text-lg">{project.impact}</p>
              </motion.div>
            )}

            <motion.div
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
              variants={itemVariants}
              className="mb-12"
            >
              <h2 className="mb-4 text-xl font-bold text-blue-300 sm:text-2xl">Technologies & Techniques</h2>
              <div className="flex flex-wrap gap-3">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 sm:text-base"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

            {project.achievements && project.achievements.length > 0 && (
              <motion.div
                initial={reduceMotion ? false : 'hidden'}
                animate="visible"
                variants={itemVariants}
                className="mb-12"
              >
                <h2 className="mb-6 text-xl font-bold text-blue-300 sm:text-2xl">Key Achievements</h2>
                <div className="space-y-4">
                  {project.achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement}
                      initial={reduceMotion ? false : { opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="flex items-start rounded-lg border-l-2 border-blue-500/50 bg-blue-500/5 p-4"
                    >
                      <span className="mr-4 flex-shrink-0 text-lg font-bold text-blue-400">&bull;</span>
                      <p className="text-base text-gray-300 sm:text-lg">{achievement}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {project.publications && project.publications.length > 0 && (
              <motion.div
                initial={reduceMotion ? false : 'hidden'}
                animate="visible"
                variants={itemVariants}
                className="mb-12"
              >
                <h2 className="mb-6 text-xl font-bold text-blue-300 sm:text-2xl">Publications</h2>
                <div className="space-y-4">
                  {project.publications.map((pub, index) => (
                    <motion.div
                      key={pub.title}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="rounded-lg border border-blue-500/20 bg-slate-900/30 p-4 transition-all hover:border-blue-500/50"
                    >
                      <h3 className="mb-2 text-base font-semibold text-blue-300 sm:text-lg">{pub.title}</h3>
                      <div className="mb-2 flex flex-col text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                        <p>{pub.publication}</p>
                        <div className="mt-2 flex items-center gap-4 sm:mt-0">
                          <p className="font-semibold text-cyan-400">{pub.year}</p>
                          {pub.citations ? (
                            <p className="font-semibold text-blue-300">Cited by {pub.citations}</p>
                          ) : null}
                        </div>
                      </div>
                      {pub.url && (
                        <a
                          href={pub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-sm text-blue-400 underline transition-colors hover:text-blue-300"
                        >
                          Read Publication &rarr;
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {project.references && project.references.length > 0 && (
              <motion.div
                initial={reduceMotion ? false : 'hidden'}
                animate="visible"
                variants={itemVariants}
                className="mb-12"
              >
                <h2 className="mb-6 text-xl font-bold text-blue-300 sm:text-2xl">References</h2>
                <div className="space-y-4">
                  {project.references.map((ref, index) => (
                    <motion.div
                      key={ref.title}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="rounded-lg border border-blue-500/20 bg-slate-900/30 p-4 transition-all hover:border-blue-500/50"
                    >
                      <h3 className="mb-2 text-base font-semibold text-blue-300 sm:text-lg">{ref.title}</h3>
                      <div className="mb-2 flex flex-col text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                        <p>{ref.source}</p>
                        {ref.year ? <p className="mt-2 font-semibold text-cyan-400 sm:mt-0">{ref.year}</p> : null}
                      </div>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm text-blue-400 underline transition-colors hover:text-blue-300"
                      >
                        Open Reference &rarr;
                      </a>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
              variants={itemVariants}
              className="mt-16 border-t border-blue-500/10 pt-12"
            >
              <h2 className="mb-8 text-2xl font-bold text-blue-300">Related Projects</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {researchProjects
                  .filter((item) => item.id !== project.id)
                  .slice(0, 2)
                  .map((relatedProject) => (
                    <Link key={relatedProject.id} href={`/research/${relatedProject.id}`}>
                      <motion.div
                        whileHover={reduceMotion ? undefined : { y: -4 }}
                        className="cursor-pointer rounded-lg border border-blue-500/20 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 transition-all hover:border-blue-500/50"
                      >
                        <h3 className="mb-2 text-lg font-bold text-blue-300">{relatedProject.title}</h3>
                        <p className="mb-4 line-clamp-2 text-sm text-gray-400">{relatedProject.shortDescription}</p>
                        <p className="text-sm font-semibold text-blue-400">Learn more &rarr;</p>
                      </motion.div>
                    </Link>
                  ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-transparent to-slate-900/50 px-4 py-16 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="mb-6 text-2xl font-bold sm:text-3xl">Want to Discuss This Research?</h3>
            <p className="mx-auto mb-8 max-w-2xl text-gray-400">
              I&apos;m always excited to discuss technical details, potential applications, or
              collaborative opportunities.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <motion.a
                href="mailto:dr.yungting.hsieh@gmail.com"
                whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                className="rounded-lg bg-gradient-to-r from-green-500 to-cyan-500 px-8 py-3 font-semibold text-white transition-all hover:shadow-lg"
              >
                Get In Touch
              </motion.a>
              <Link href="/research">
                <motion.button
                  whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  className="rounded-lg border border-blue-400/50 px-8 py-3 font-semibold text-blue-300 transition-all hover:text-blue-200"
                >
                  Back to All Projects
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
