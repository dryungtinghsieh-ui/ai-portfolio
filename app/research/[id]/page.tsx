'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { researchProjects } from '@/lib/research-data';
import { notFound } from 'next/navigation';

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

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const project = researchProjects.find((p) => p.id === params.id);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen w-full bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-black opacity-90" />
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
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

        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{
            y: [0, 30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{
            y: [0, -30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with navigation */}
        <section className="pt-12 px-4 sm:px-6 lg:px-8 border-b border-blue-500/10">
          <div className="max-w-6xl mx-auto pb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <Link
                  href="/research"
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span className="mr-2">←</span>
                  <span>Back to Projects</span>
                </Link>
              </div>
              <Link
                href="/"
                className="text-gray-400 hover:text-blue-300 transition-colors text-sm"
              >
                Home
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={itemVariants}
            >
              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {project.title}
                </span>
              </h1>

              {/* Short Description */}
              <p className="text-lg sm:text-xl text-cyan-300 mb-12 font-medium">
                {project.shortDescription}
              </p>
            </motion.div>

            {/* Full Description */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              className="mb-12 p-6 sm:p-8 rounded-xl bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-blue-500/20"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-blue-300 mb-4">
                Overview
              </h2>
              <p className="text-gray-300 leading-relaxed text-base sm:text-lg">
                {project.fullDescription}
              </p>
            </motion.div>

            {/* Impact Section */}
            {project.impact && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                className="mb-12 p-6 sm:p-8 rounded-xl bg-gradient-to-r from-green-900/20 to-cyan-900/20 border border-green-500/20"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-green-400 mb-4">
                  Real-World Impact
                </h2>
                <p className="text-gray-300 leading-relaxed text-base sm:text-lg">
                  {project.impact}
                </p>
              </motion.div>
            )}

            {/* Technologies */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              className="mb-12"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-blue-300 mb-4">
                Technologies & Techniques
              </h2>
              <div className="flex flex-wrap gap-3">
                {project.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm sm:text-base"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            {project.achievements && project.achievements.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                className="mb-12"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-cyan-300 mb-6">
                  Key Achievements
                </h2>
                <div className="space-y-4">
                  {project.achievements.map((achievement, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start p-4 rounded-lg bg-blue-500/5 border-l-2 border-blue-500/50"
                    >
                      <span className="mr-4 text-blue-400 font-bold text-lg flex-shrink-0">
                        ✓
                      </span>
                      <p className="text-gray-300 text-base sm:text-lg">
                        {achievement}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Publications */}
            {project.publications && project.publications.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                className="mb-12"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-blue-300 mb-6">
                  Publications
                </h2>
                <div className="space-y-4">
                  {project.publications.map((pub, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-lg bg-slate-900/30 border border-blue-500/20 hover:border-blue-500/50 transition-all"
                    >
                      <h3 className="font-semibold text-blue-300 text-base sm:text-lg mb-2">
                        {pub.title}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-400">
                        <p>{pub.publication}</p>
                        <p className="text-cyan-400 font-semibold">{pub.year}</p>
                      </div>
                      {pub.url && (
                        <a
                          href={pub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-blue-400 hover:text-blue-300 transition-colors text-sm underline"
                        >
                          Read Publication →
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Related Projects */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              className="mt-16 pt-12 border-t border-blue-500/10"
            >
              <h2 className="text-2xl font-bold text-blue-300 mb-8">
                Related Projects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {researchProjects
                  .filter((p) => p.id !== project.id)
                  .slice(0, 2)
                  .map((relatedProject) => (
                    <Link key={relatedProject.id} href={`/research/${relatedProject.id}`}>
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="p-6 rounded-lg bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-blue-500/20 hover:border-blue-500/50 transition-all cursor-pointer"
                      >
                        <h3 className="font-bold text-blue-300 mb-2 text-lg">
                          {relatedProject.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                          {relatedProject.shortDescription}
                        </p>
                        <p className="text-blue-400 text-sm font-semibold">
                          Learn more →
                        </p>
                      </motion.div>
                    </Link>
                  ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-transparent to-slate-900/50">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-6">
              Want to Discuss This Research?
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              I'm always excited to discuss technical details, potential applications, or collaborative opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="mailto:contact@example.com"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-cyan-500 font-semibold text-black hover:shadow-lg transition-all"
              >
                Get In Touch
              </motion.a>
              <Link href="/research">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-lg border border-blue-400/50 font-semibold text-blue-300 hover:text-blue-200 transition-all"
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

// Generate static params for all projects
export function generateStaticParams() {
  return researchProjects.map((project) => ({
    id: project.id,
  }));
}
