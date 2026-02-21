'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
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

export default function ResearchPage() {
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
        {/* Header with back button */}
        <section className="pt-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                href="/"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-8"
              >
                <span className="mr-2">←</span>
                <span>Back to Home</span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-6xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="mb-6 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight"
            >
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Research Projects
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-2"
            >
              Pioneering work in AI-assisted signal integrity, hybrid neural networks, and neuromorphic computing
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-md sm:text-lg text-cyan-300 max-w-2xl mx-auto"
            >
              Publications in IEEE, ACM, and leading technical conferences
            </motion.p>
          </motion.div>
        </section>

        {/* Projects Grid */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {researchProjects.map((project) => (
                <motion.div key={project.id} variants={itemVariants}>
                  <Link href={`/research/${project.id}`}>
                    <motion.div
                      className="h-full p-6 sm:p-8 rounded-xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group"
                      whileHover={{
                        borderColor: 'rgba(59, 130, 246, 0.5)',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)',
                      }}
                    >
                      {project.image && (
                        <div className="mb-5 relative h-48 sm:h-56 w-full overflow-hidden rounded-lg border border-blue-500/20 bg-slate-900/60">
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}

                      {/* Project Title */}
                      <h3 className="text-xl sm:text-2xl font-bold mb-4 text-blue-300 group-hover:text-blue-200 transition-colors">
                        {project.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-gray-300 text-sm sm:text-base mb-6 line-clamp-3">
                        {project.shortDescription}
                      </p>

                      {/* Technologies */}
                      <div className="mb-6">
                        <p className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                          Technologies
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.slice(0, 4).map((tech, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 text-xs rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 4 && (
                            <span className="px-3 py-1 text-xs rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300">
                              +{project.technologies.length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Key Achievement or Impact */}
                      {project.achievements && project.achievements.length > 0 && (
                        <div className="mb-6 p-3 rounded-lg bg-blue-500/5 border-l-2 border-blue-500/50">
                          <p className="text-sm text-blue-200">
                            <span className="font-semibold">Key Achievement:</span>{' '}
                            {project.achievements[0]}
                          </p>
                        </div>
                      )}

                      {/* Publications */}
                      {project.publications && project.publications.length > 0 && (
                        <div className="mb-6">
                          <p className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                            Publications ({project.publications.length})
                          </p>
                          <ul className="text-xs text-gray-400 space-y-1">
                            {project.publications.slice(0, 2).map((pub, i) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2 text-blue-400">•</span>
                                <span>{pub.title} ({pub.year})</span>
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

                      {/* References */}
                      {project.references && project.references.length > 0 && (
                        <div className="mb-6">
                          <p className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                            References ({project.references.length})
                          </p>
                          <ul className="text-xs text-gray-400 space-y-1">
                            {project.references.slice(0, 2).map((ref, i) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2 text-blue-400">•</span>
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

                      {/* View Details Button */}
                      <motion.div
                        className="flex items-center text-blue-400 font-semibold text-sm group-hover:text-blue-300 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <span>View Details</span>
                        <span className="ml-2">→</span>
                      </motion.div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-slate-900/30 to-black">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {[
                { label: 'Research Projects', value: researchProjects.length },
                {
                  label: 'Publications',
                  value: researchProjects.reduce(
                    (acc, p) => acc + (p.publications?.length || 0),
                    0
                  ),
                },
                {
                  label: 'Patents Filed',
                  value: 2,
                },
                { label: 'Impact', value: '8M+' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20"
                >
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </p>
                  <p className="text-sm sm:text-base text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-6">
              Interested in Collaboration?
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Let's discuss research opportunities, technical partnerships, or AI-driven solutions for your engineering challenges.
            </p>
            <motion.a
              href="mailto:contact@example.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-cyan-500 font-semibold text-black hover:shadow-lg transition-all"
            >
              Get In Touch
            </motion.a>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
