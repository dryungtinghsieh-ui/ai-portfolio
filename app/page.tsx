'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [hoveredTag, setHoveredTag] = useState<number | null>(null);

  const expertiseTags = [
    'Signal Integrity',
    'TDR',
    'S-Parameters',
    'Hybrid Neural Networks',
    'Spiking Neural Networks',
    'Edge AI',
    'Analog AI',
    'Machine Learning',
    'TensorFlow',
    'PyTorch',
    'MEMS Simulation',
  ];

  const highlights = [
    { label: 'PhD, ECE', value: 'Rutgers (2026)', icon: '🎓' },
    { label: 'Publications', value: '8 IEEE/ACM + 4 Journals', icon: '📚' },
    { label: 'Patents', value: '2 US Patents', icon: '🔬' },
    { label: 'Award', value: 'TE AI Cup Winner', icon: '🏆' },
  ];

  const socials = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/yung-ting-hsieh-b0859a155',
      icon: '🔗',
    },
    {
      name: 'Google Scholar',
      url: 'https://scholar.google.com.tw/citations?user=TSoiF94AAAAJ',
      icon: '📖',
    },
    {
      name: 'GitHub',
      url: 'https://github.com',
      icon: '💻',
    },
  ];

  // Neural network background animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
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
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
      },
    }),
    hover: {
      scale: 1.1,
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
      transition: { duration: 0.2 },
    },
  };

  return (
    <main className="min-h-screen w-full bg-black text-white overflow-hidden">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-black opacity-90" />

        {/* Neural network grid */}
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

        {/* Glowing gradient orbs */}
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
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-6xl w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left: Content */}
              <div className="text-center md:text-left">
                {/* Title */}
                <motion.h1
                  variants={itemVariants}
                  className="mb-6 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight"
                >
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Dr. Yung-Ting Hsieh
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.div variants={itemVariants} className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-blue-300 mb-2">
                    AI-Assisted Signal Integrity Engineer
                  </h2>
                  <p className="text-lg sm:text-xl text-cyan-300 font-medium">
                    Analog-Digital Hybrid Neural Network Researcher
                  </p>
                </motion.div>

                {/* Tagline */}
                <motion.p
                  variants={itemVariants}
                  className="text-lg sm:text-xl text-gray-300 mb-12 leading-relaxed"
                >
                  Bridging Physics-Based Modeling with Machine Learning for
                  Next-Generation High-Speed Interconnect Systems
                </motion.p>

                {/* Key Achievement */}
                <motion.div
                  variants={itemVariants}
                  className="mb-12 p-6 sm:p-8 rounded-xl bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-blue-500/20 backdrop-blur-sm"
                >
                  <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
                    <span className="text-cyan-300 font-semibold">Senior R&D Engineer at TE Connectivity</span> specializing in AI-assisted S-parameter prediction, TDR signal interpretation, and Analog-Digital Hybrid Neural Networks.
                  </p>
                  <p className="text-gray-300 text-xs sm:text-sm mt-4 font-mono text-blue-300">
                    Developed ML pipeline achieving 4000× computational acceleration with 4% prediction error → $12.5M USD capital savings
                  </p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-12"
                >
                  <motion.a
                    href="#projects"
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold text-black transition-all duration-200 hover:shadow-lg"
                  >
                    View Research Projects
                  </motion.a>

                  <motion.a
                    href="/cv.pdf"
                    whileHover={{ scale: 1.05, borderColor: 'rgba(59, 130, 246, 0.8)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-lg border border-blue-400/50 font-semibold text-blue-300 hover:text-blue-200 transition-all duration-200"
                  >
                    Download CV
                  </motion.a>

                  <motion.a
                    href="mailto:contact@example.com"
                    whileHover={{ scale: 1.05, borderColor: 'rgba(34, 197, 94, 0.8)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-lg border border-green-500/50 font-semibold text-green-400 hover:text-green-300 transition-all duration-200"
                  >
                    Contact Me
                  </motion.a>
                </motion.div>

                {/* Social Links */}
                <motion.div
                  variants={itemVariants}
                  className="flex gap-6 justify-center md:justify-start"
                >
                  {socials.map((social, i) => (
                    <motion.a
                      key={i}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-2xl text-gray-400 hover:text-blue-400 transition-colors"
                      whileHover={{ scale: 1.2, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      title={social.name}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </motion.div>
              </div>

              {/* Right: Portrait Image */}
              <motion.div
                variants={itemVariants}
                className="flex justify-center"
              >
                <div className="relative w-72 h-96 md:w-80 md:h-full max-h-96">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl blur-2xl"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-2xl">
                    <Image
                      src="/portrait.jpg"
                      alt="Dr. Yung-Ting Hsieh"
                      width={320}
                      height={400}
                      priority
                      className="w-full h-full object-cover object-center"
                    />
                    {/* Overlay gradient for polish */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-slate-900/30 to-black">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-bold mb-12 text-center"
            >
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Technical Expertise
              </span>
            </motion.h2>

            <motion.div
              className="flex flex-wrap gap-3 justify-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {expertiseTags.map((tag, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={tagVariants}
                  whileHover="hover"
                  onHoverStart={() => setHoveredTag(i)}
                  onHoverEnd={() => setHoveredTag(null)}
                  className={`px-4 py-2 rounded-full border cursor-pointer transition-all duration-200 ${
                    hoveredTag === i
                      ? 'bg-blue-600/40 border-blue-400 text-blue-200'
                      : 'bg-slate-900/40 border-blue-500/30 text-gray-300'
                  }`}
                >
                  {tag}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Footer Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        {/* CTA Footer */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-6">
              Let's Collaborate on{' '}
              <span className="text-blue-400">Next-Gen AI Solutions</span>
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Interested in discussing signal integrity, neural networks, or edge AI hardware?
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
