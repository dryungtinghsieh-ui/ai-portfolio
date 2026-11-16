import type { Metadata } from 'next';
import Link from 'next/link';
import { CertificateGallery } from './certificate-gallery';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Certifications — From Simulation to Silicon',
  description: 'The MEMS simulation and VLSI training behind my early CMUT research at National Chiao Tung University, with four original certificates from 2016–2017.',
};

export default function CertificationsPage() {
  return (
    <main data-palette="graphite" className={`portfolio-theme ${styles.page}`}>
      <div className={styles.container}>
        <nav className={styles.nav} aria-label="Page navigation">
          <Link href="/">← Back to Home</Link>
          <Link href="/research">Explore Research ↗</Link>
        </nav>

        <header className={styles.hero}>
          <p className={styles.eyebrow}>CERTIFICATIONS / 2016–2017</p>
          <h1>From Simulation<br />to <span>Silicon.</span></h1>
          <p className={styles.lead}>The training behind my early journey in MEMS and semiconductor research.</p>
          <div className={styles.heroBottom}>
            <p>Four certificates. One research journey.<br />National Chiao Tung University · Taiwan</p>
            <a href="#certificates" className={styles.button}>Explore the certificates ↓</a>
          </div>
        </header>

        <section className={styles.story} aria-labelledby="story-title">
          <div>
            <p className={styles.eyebrow}>THE RESEARCH BEHIND THE TRAINING</p>
            <h2 id="story-title">Making a model<br />meet the real world.</h2>
          </div>
          <div className={styles.prose}>
            <p>During my master’s studies at National Chiao Tung University, I worked on capacitive micromachined ultrasonic transducers (CMUTs) for airborne ultrasonic sensing. The project brought together physics, acoustic wave propagation, simulation, and semiconductor microfabrication.</p>
            <p>I used COMSOL to study diaphragm displacement and mechanical response, and MATLAB to investigate acoustic fields, interference between transducer elements, and signal processing. On the fabrication side, my research involved silicon wafer etching, metal sputtering, and thin-film structures, with support from National Nano Device Laboratories (NDL).</p>
            <p>The MEMS and VLSI training documented here complemented that work on a CMUT operating at approximately 100 kHz. Together, these experiences connected the behavior of a simulated diaphragm to the constraints of fabricating and evaluating a physical device.</p>
          </div>
        </section>

        <div className={styles.path} aria-label="Research workflow">
          <div><span>01 / MODEL</span><strong>Diaphragm response</strong><p>COMSOL · MEMS simulation</p></div>
          <div><span>02 / ANALYZE</span><strong>Acoustic behavior</strong><p>MATLAB · Fields &amp; signals</p></div>
          <div><span>03 / FABRICATE</span><strong>Physical devices</strong><p>NDL · VLSI processes</p></div>
        </div>

        <section id="certificates" className={styles.certificates} aria-labelledby="certificates-title">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>THE ORIGINAL DOCUMENTS</p><h2 id="certificates-title">Training, with a story.</h2></div>
            <a href="/certifications/Certificates_compressed.pdf" target="_blank" rel="noopener noreferrer">Open all four certificates (PDF) ↗</a>
          </div>
          <CertificateGallery />
        </section>

        <section className={styles.reflection} aria-labelledby="reflection-title">
          <p className={styles.eyebrow}>A FOUNDATION FOR WHAT CAME NEXT</p>
          <h2 id="reflection-title">From physical principles<br />to engineering systems.</h2>
          <p>These four certificates mark an early chapter in my transition from studying physics to designing, simulating, and experimentally evaluating real engineering systems. That connection between models and measurements continues through my work in sensors, signal processing, and hardware.</p>
          <Link href="/research" className={styles.button}>Continue to my research ↗</Link>
        </section>

        <footer className={styles.footer}>
          <p>Dr. Yung-Ting Hsieh</p>
          <p>Research narrative drawn from my 2018 statement of purpose and 2018 / 2022 CVs.<br />Certificate titles, dates, and training hours checked against the original scans.</p>
        </footer>
      </div>
    </main>
  );
}
