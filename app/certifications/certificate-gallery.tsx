'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import styles from './page.module.css';

const certificates = [
  {
    title: 'ITRI MEMS Simulation Training',
    issuer: 'Industrial Technology Research Institute',
    date: 'November 2–3, 2016',
    hours: '14 hours',
    original: 'MEMS 微機電致動器與感測器模擬分析技術培訓班',
    theme: 'Understanding the moving diaphragm',
    story: 'My CMUT research required understanding how a micromachined diaphragm moves. This MEMS actuator and sensor simulation training complemented the finite element modeling I used to study its mechanical response.',
    tags: 'MEMS · Finite element analysis',
  },
  {
    title: 'COMSOL MEMS Modeling',
    issuer: 'COMSOL · Training at ITRI',
    date: 'November 2–3, 2016',
    hours: '2 days',
    original: 'Industrial Oriented MEMS Modeling Training',
    theme: 'Connecting mechanics and acoustics',
    story: 'The course covered coupled MEMS models, including capacitive pressure sensors and piezoelectric actuators. In my research, I used COMSOL for diaphragm response and MATLAB for acoustic fields, element spacing, interference, and signal analysis.',
    tags: 'COMSOL · Multiphysics modeling',
  },
  {
    title: 'NDL VLSI Laboratory Processing Equipment',
    issuer: 'National Nano Device Laboratories',
    date: 'January 23–24, 2017',
    hours: '14 hours',
    original: 'VLSI Laboratory Course–Advance Processing Equipments',
    theme: 'From the screen to the laboratory',
    story: 'Working with fabrication meant understanding the equipment behind a device. This laboratory training complemented my exposure to silicon wafer processing and metal sputtering during the development of CMUT structures with NDL support.',
    tags: 'Laboratory equipment · Microfabrication',
  },
  {
    title: 'NDL VLSI Technology',
    issuer: 'National Nano Device Laboratories',
    date: 'January 16–20, 2017',
    hours: '30 hours',
    original: 'VLSI Training Course–Advance Processing for VLSI Technology',
    theme: 'Bringing the design into silicon',
    story: 'This VLSI process training connects to the fabrication side of my master’s research: silicon etching, electrode deposition, and thin-film structures. My work on an approximately 100 kHz CMUT brought these process considerations together with simulation and experimental characterization.',
    tags: 'VLSI processes · Silicon devices',
  },
];

export function CertificateGallery() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);
  const selected = certificates[active];

  function openCertificate(index: number) {
    setActive(index);
    dialog.current?.showModal();
  }

  return (
    <>
      <div className={styles.grid}>
        {certificates.map((certificate, index) => (
          <article key={certificate.title} className={styles.card}>
            <button className={styles.scanButton} onClick={() => openCertificate(index)} aria-label={`Enlarge ${certificate.title} certificate`} aria-haspopup="dialog">
              <Image src={`/certifications/certificate-${index + 1}.png`} alt={`Original certificate for ${certificate.title}, issued to Yung-Ting Hsieh`} width={1273} height={1800} className={styles.scan} sizes="(max-width: 700px) 90vw, 540px" />
              <span className={styles.scanCaption}>View original scan <span aria-hidden="true">↗</span></span>
            </button>
            <div className={styles.cardBody}>
              <div className={styles.cardMeta}><span>0{index + 1}</span><span>{certificate.date} · {certificate.hours}</span></div>
              <h3>{certificate.title}</h3>
              <p className={styles.issuer}>{certificate.issuer}</p>
              <details className={styles.details}><summary>Course title on the certificate</summary><p>{certificate.original}</p></details>
              <h4>{certificate.theme}</h4>
              <p className={styles.cardStory}>{certificate.story}</p>
              <p className={styles.tags}>{certificate.tags}</p>
            </div>
          </article>
        ))}
      </div>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby="certificate-dialog-title" onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div className={styles.dialogHeader}>
          <div><p className={styles.eyebrow}>ORIGINAL SCAN · {active + 1} / 4</p><h2 id="certificate-dialog-title">{selected.title}</h2></div>
          <button onClick={() => dialog.current?.close()} className={styles.closeButton} aria-label="Close certificate viewer" autoFocus>Close ×</button>
        </div>
        <div className={styles.dialogImage}>
          <Image src={`/certifications/certificate-${active + 1}.png`} alt={`Full original scan: ${selected.title}`} width={1273} height={1800} unoptimized />
        </div>
        <div className={styles.dialogFooter}>
          <button onClick={() => setActive((active + 3) % 4)}>← Previous</button>
          <a href={`/certifications/Certificates_compressed.pdf#page=${active + 1}`} target="_blank" rel="noopener noreferrer">Open original PDF ↗</a>
          <button onClick={() => setActive((active + 1) % 4)}>Next →</button>
        </div>
      </dialog>
    </>
  );
}
