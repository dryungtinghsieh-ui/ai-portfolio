export interface ResearchProject {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  image?: string;
  technologies: string[];
  publications?: {
    title: string;
    url?: string;
    publication: string;
    year: number;
    citations?: number;
    scholarId?: string;
  }[];
  references?: {
    title: string;
    url: string;
    source: string;
    year?: number;
  }[];
  achievements?: string[];
  impact?: string;
}

export const researchProjects: ResearchProject[] = [
  {
    id: 'ai-s-parameter-prediction',
    title: 'AI-Assisted S-Parameter Prediction',
    shortDescription:
      'Like a GPS for high-speed circuits: AI predicts signal behavior in seconds instead of waiting hours for simulations.',
    fullDescription:
      'When engineers design high-speed connectors, tiny signal reflections can break an entire product. Traditionally, teams run heavy electromagnetic simulations and wait a long time for each design trial. In the TE AI Cup 2022-23 challenge, our team proposed novel neural-network architectures and signal pre-processing methods to predict IEEE-standard Channel Operating Margin (COM) parameters, replacing a time-consuming model-based MATLAB workflow. In plain terms, instead of repeatedly baking a whole cake to test one ingredient, we can taste a reliable sample first. That means faster design decisions, fewer costly dead-ends, and much quicker time-to-market while keeping engineering accuracy at production level.',
    image: '/research/ai-cup.jpg',
    technologies: [
      'TensorFlow',
      'PyTorch',
      'Signal Processing',
      'S-Parameters',
      'Channel Operating Margin (COM)',
      'Deep Learning',
      'High-Speed Interconnects',
    ],
    references: [
      {
        title: 'Rutgers ECE Team Won Best AI Innovation Prize in TE AI Cup 2022-23',
        source: 'Rutgers University ECE Newsletter 2023',
        year: 2024,
        url: 'https://ece.rutgers.edu/sites/default/files/2024-06/ECE_Newsletter_2023.pdf',
      },
    ],
    achievements: [
      'Up to 4000x faster prediction than traditional full simulation workflows',
      'Around 4% error while staying useful for real design decisions',
      'About $12.5M saved through faster design iteration and reduced prototyping',
      'Deployed in production at TE Connectivity',
      'Won Best AI Innovation Prize in TE AI Cup 2022-23',
      'Ranked first among 40 teams from 25 universities worldwide',
      'Recognized in Rutgers ECE Newsletter with team members from CPS Lab and ECE',
    ],
    impact:
      'Turned a slow trial-and-error design cycle into a rapid feedback loop engineers can use daily.',
  },
  {
    id: 'hybrid-neural-networks',
    title: 'Ultra-low Power Analog Folded Neural Network for Cardiovascular Health Monitoring',
    shortDescription:
      'A wearable heart guardian that can run with extremely low power and continuously check ECG signals.',
    fullDescription:
      'Most health wearables trade battery life for intelligence. This project redesigns that balance. We built an analog folded neural network that works like a compact, energy-sipping specialist for ECG patterns. Folded means the same hardware is reused cleverly over time, so we do more with less power and less chip area. For non-experts: imagine one skilled doctor examining patients one by one very efficiently instead of hiring a full hospital for every check. The result is continuous heart monitoring with tiny energy needs, opening the door to lighter, longer-lasting, and more practical preventive healthcare devices.',
    image: '/research/ecg_acqnmon-exp.jpg',
    technologies: [
      'Analog Neural Networks',
      'Folded Neural Networks',
      'Ultra-Low Power Design',
      'Health Monitoring',
      'Wearable Computing',
      'ECG Signal Processing',
      'Distributed Sensing',
      'VLSI',
    ],
    publications: [
      {
        title:
          'Neural network design via voltage-based resistive processing unit and diode activation function-a new architecture',
        publication:
          '2021 IEEE International Midwest Symposium on Circuits and Systems (MWSCAS)',
        year: 2021,
        url: 'https://scholar.google.com.tw/citations?view_op=view_citation&hl=zh-TW&user=TSoiF94AAAAJ&citation_for_view=TSoiF94AAAAJ:2osOgNQ5qMEC',
        citations: 18,
        scholarId: '2osOgNQ5qMEC',
      },
      {
        title:
          'Ultra-low Power Analog Recurrent Neural Network Design Approximation for Wireless Health Monitoring',
        publication:
          '2022 IEEE 19th International Conference on Mobile Ad Hoc and Smart Systems (MASS)',
        year: 2022,
        url: 'https://scholar.google.com.tw/citations?view_op=view_citation&hl=zh-TW&user=TSoiF94AAAAJ&citation_for_view=TSoiF94AAAAJ:YsMSGLbcyi4C',
        citations: 14,
        scholarId: 'YsMSGLbcyi4C',
      },
      {
        title:
          'Hybrid analog-digital sensing approach for low-power real-time anomaly detection in drones',
        publication:
          '2021 IEEE 18th International Conference on Mobile Ad Hoc and Smart Systems (MASS)',
        year: 2021,
        url: 'https://scholar.google.com.tw/citations?view_op=view_citation&hl=zh-TW&user=TSoiF94AAAAJ&citation_for_view=TSoiF94AAAAJ:Tyk-4Ss8FVUC',
        citations: 12,
        scholarId: 'Tyk-4Ss8FVUC',
      },
      {
        title:
          'Ultra-low power analog folded neural network for cardiovascular health monitoring',
        publication: 'IEEE Journal of Biomedical and Health Informatics',
        year: 2024,
        url: 'https://scholar.google.com.tw/citations?view_op=view_citation&hl=zh-TW&user=TSoiF94AAAAJ&citation_for_view=TSoiF94AAAAJ:4TOpqqG69KYC',
        citations: 6,
        scholarId: '4TOpqqG69KYC',
      },
    ],
    achievements: [
      'Near-batteryless operating profile through serialized computation',
      'Optimized 6-layer model (hidden size 30) for ECG anomaly screening',
      'Continuous monitoring suitable for day-long wearable use',
      'Strong detection performance for key cardiovascular warning patterns',
      'Low thermal noise and compact on-chip footprint',
      'Lower peak power compared with conventional analog neural implementations',
    ],
    impact:
      'Makes always-on heart monitoring more realistic for everyday users, not just clinical environments.',
  },
  {
    id: 'spiking-neural-networks',
    title: 'Spiking Neural Networks for Signal Processing',
    shortDescription:
      'Brain-inspired AI that fires only when needed, reducing power use for always-on sensing.',
    fullDescription:
      'Regular neural networks compute constantly, even when nothing important is happening. Spiking neural networks behave more like real neurons: they stay quiet and activate only when meaningful events appear. For beginners, this is like motion-sensor lights compared with lights that are always on. We apply this idea to signal analysis so systems can watch streams in real time while using far less energy. That makes SNNs attractive for edge devices, smart cameras, and IoT sensors that must stay alert without draining batteries.',
    image: '/research/snn-exp.jpg',
    technologies: [
      'Spiking Neural Networks',
      'Neuromorphic Computing',
      'TDR Signal Processing',
      'Temporal Coding',
      'Edge Computing',
      'Event-Driven Processing',
    ],
    publications: [
      {
        title: 'A lightweight hybrid analog-digital spiking neural network for iot',
        publication:
          '2024 20th International Conference on Distributed Computing in Smart Systems and the Internet of Things (DCOSS-IoT)',
        year: 2024,
        url: 'https://scholar.google.com.tw/citations?view_op=view_citation&hl=zh-TW&user=TSoiF94AAAAJ&citation_for_view=TSoiF94AAAAJ:4DMP91E08xMC',
        citations: 4,
        scholarId: '4DMP91E08xMC',
      },
      {
        title:
          'A Bio-inspired Low-power Hybrid Analog/Digital Spiking Neural Networks for Pervasive Smart Cameras',
        publication:
          '2024 IEEE International Conference on Pervasive Computing and Communications Workshops and other Affiliated Events (PerCom Workshops)',
        year: 2024,
        url: 'https://scholar.google.com.tw/citations?view_op=view_citation&hl=zh-TW&user=TSoiF94AAAAJ&citation_for_view=TSoiF94AAAAJ:M3ejUd6NZC8C',
        citations: 2,
        scholarId: 'M3ejUd6NZC8C',
      },
    ],
    achievements: [
      'Up to 1000x lower energy use compared with conventional dense neural processing',
      'Real-time signal processing capability',
      'Demonstrated on Intel Loihi neuromorphic hardware',
      'Captures time-based signal patterns that standard models often miss',
    ],
    impact: 'Enables practical always-on AI for low-power edge products.',
  },
  {
    id: 'underwater-acoustic-communications',
    title: 'Full-Duplex Underwater Acoustic Communications',
    shortDescription:
      'Lets underwater robots talk and listen at the same time, like a real conversation instead of walkie-talkie turns.',
    fullDescription:
      "Underwater communication is hard because radio waves do not travel well in water, so teams rely on sound. Traditional systems act like walkie-talkies: one side speaks, then waits. This research enables true full-duplex communication, where both sides talk and hear simultaneously. The core trick is canceling a device's own loud echo so it can still hear incoming signals. Think of trying to hear a friend while shouting in a tunnel; we build the anti-echo hearing aid that makes it possible. This significantly improves coordination speed for underwater robots, monitoring stations, and ocean exploration missions.",
    image: '/research/underwater-acoustic-exp.jpg',
    technologies: [
      'Acoustic Communications',
      'Full-Duplex Technology',
      'Signal Processing',
      'Interference Cancellation',
      'Underwater Acoustics',
      'Vector Sensors',
      'Autonomous Underwater Vehicles',
    ],
    publications: [
      {
        title: 'FD-UWA: Full-duplex underwater acoustic comms via self-interference cancellation in space',
        publication:
          '2020 IEEE 17th International Conference on Mobile Ad Hoc and Sensor Systems (MASS)',
        year: 2020,
        url: 'https://scholar.google.com.tw/citations?view_op=view_citation&hl=zh-TW&user=TSoiF94AAAAJ&citation_for_view=TSoiF94AAAAJ:d1gkVwhDpl0C',
        citations: 18,
        scholarId: 'd1gkVwhDpl0C',
      },
      {
        title: 'Full-Duplex Underwater Acoustic Communications via Self-Interference Cancellation in Space',
        publication: 'Journal of Communications and Networks 25(2), 167-181',
        year: 2023,
        url: 'https://scholar.google.com.tw/citations?view_op=view_citation&hl=zh-TW&user=TSoiF94AAAAJ&citation_for_view=TSoiF94AAAAJ:MXK_kJrjxJIC',
        citations: 21,
        scholarId: 'MXK_kJrjxJIC',
      },
      {
        title: 'ML-based joint Doppler estimation and compensation in underwater acoustic communications',
        publication:
          'Proceedings of the 16th International Conference on Underwater Networks and Systems (WUWNet)',
        year: 2022,
        url: 'https://scholar.google.com.tw/citations?view_op=view_citation&hl=zh-TW&user=TSoiF94AAAAJ&citation_for_view=TSoiF94AAAAJ:eQOLeE2rZwMC',
        citations: 17,
        scholarId: 'eQOLeE2rZwMC',
      },
      {
        title:
          'Demo: ML-based Joint Doppler Estimation and Compensation in Underwater Acoustic Comms',
        publication: 'ACM WUWNet Demo',
        year: 2022,
        url: 'https://scholar.google.com.tw/citations?view_op=view_citation&hl=zh-TW&user=TSoiF94AAAAJ&citation_for_view=TSoiF94AAAAJ:Zph67rFs4hoC',
        citations: 0,
        scholarId: 'Zph67rFs4hoC',
      },
    ],
    achievements: [
      'Around 2x channel efficiency versus half-duplex underwater links',
      'Real-time bidirectional communication underwater',
      'Adaptive steering angle adjustment via integrated protocol',
      'Validated in real underwater acoustic channels',
      'Supports advanced phased-array beamforming techniques',
    ],
    impact:
      'Turns underwater networking from turn-taking messaging into true real-time teamwork.',
  },
];
