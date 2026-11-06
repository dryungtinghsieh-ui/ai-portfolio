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
      'Neural modeling and signal preprocessing to accelerate Channel Operating Margin prediction for high-speed interconnect evaluation.',
    fullDescription:
      'High-speed interconnect evaluation depends on repeated signal analysis, which can make design exploration computationally expensive. For the TE AI Cup 2022-23, our Rutgers team developed neural-network architectures and signal preprocessing methods to predict IEEE-standard Channel Operating Margin (COM) parameters in place of a time-consuming model-based MATLAB workflow. The project received the Best AI Innovation prize. Rutgers estimated $12.5M in potential savings in tester time and capital expenditure for high-speed testing.',
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
      'Best AI Innovation prize, TE AI Cup 2022-23',
      'Neural-network architectures and signal preprocessing for COM parameter prediction',
      'Project benchmarks reported up to 4,000× faster prediction and approximately 4% prediction error; results are specific to the evaluated workflow',
      'Estimated $12.5M in potential tester-time and capital-expenditure savings, as reported by Rutgers',
      'Recognized in a competition involving 40 teams from 25 universities',
    ],
    impact:
      'Demonstrates how learned models can accelerate a defined SI evaluation workflow, with potential reductions in high-speed testing time and equipment cost.',
  },
  {
    id: 'hybrid-neural-networks',
    title: 'Ultra-Low-Power Analog Neural Networks for ECG Monitoring',
    shortDescription:
      'Analog neural-network architectures that reuse computation hardware to reduce power and area requirements for ECG monitoring.',
    fullDescription:
      'Continuous ECG analysis requires inference within tight power and hardware budgets. This research investigates analog folded neural networks, reusing computation resources over time rather than allocating separate hardware to every operation. The work spans resistive processing units, analog activation functions, and hybrid analog-digital sensing architectures. The engineering focus is the tradeoff among inference capability, circuit complexity, and power consumption for wearable health-monitoring applications.',
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
        citations: 21,
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
        citations: 11,
        scholarId: 'Tyk-4Ss8FVUC',
      },
      {
        title:
          'Ultra-low power analog folded neural network for cardiovascular health monitoring',
        publication: 'IEEE Journal of Biomedical and Health Informatics',
        year: 2024,
        url: 'https://scholar.google.com.tw/citations?view_op=view_citation&hl=zh-TW&user=TSoiF94AAAAJ&citation_for_view=TSoiF94AAAAJ:4TOpqqG69KYC',
        citations: 10,
        scholarId: '4TOpqqG69KYC',
      },
    ],
    achievements: [
      'Analog folded computation for resource-constrained ECG inference',
      'Evaluation of a six-layer model with hidden size 30 for ECG anomaly screening',
      'Hardware reuse to address power and circuit-area constraints',
      'Related work published in IEEE Journal of Biomedical and Health Informatics, MASS, and MWSCAS',
    ],
    impact:
      'Explores a lower-power implementation path for continuous ECG analysis through neural-network and circuit architecture co-design.',
  },
  {
    id: 'spiking-neural-networks',
    title: 'Spiking Neural Networks for Signal Processing',
    shortDescription:
      'Hybrid analog-digital and event-driven neural architectures for power-constrained sensing and temporal signal processing.',
    fullDescription:
      'Always-on sensing must extract useful information from time-varying inputs within a limited energy budget. This research examines spiking neural networks and hybrid analog-digital implementations for IoT sensing and smart-camera applications. The work focuses on temporal representations and event-driven computation, assessing how neural architecture and hardware implementation affect the cost of continuous signal processing.',
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
      'Hybrid analog-digital spiking neural-network designs for IoT applications',
      'Temporal and event-driven processing for low-power sensing',
      'Research on pervasive smart-camera implementations',
      'Publications at DCOSS-IoT and IEEE PerCom Workshops',
    ],
    impact:
      'Investigates how event-driven neural processing can support continuous sensing under constrained power budgets.',
  },
  {
    id: 'underwater-acoustic-communications',
    title: 'Full-Duplex Underwater Acoustic Communications',
    shortDescription:
      'Spatial self-interference cancellation and Doppler compensation for simultaneous underwater acoustic transmission and reception.',
    fullDescription:
      'Full-duplex underwater acoustic links must recover incoming signals while suppressing interference from their own transmitter. This research addresses that constraint through spatial self-interference cancellation, supported by work on joint Doppler estimation and compensation. The objective is to improve acoustic-channel utilization while accounting for the propagation and motion effects that complicate underwater communications. The project connects signal-processing methods with experimental acoustic-link evaluation.',
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
        citations: 19,
        scholarId: 'd1gkVwhDpl0C',
      },
      {
        title: 'Full-Duplex Underwater Acoustic Communications via Self-Interference Cancellation in Space',
        publication: 'Journal of Communications and Networks 25(2), 167-181',
        year: 2023,
        url: 'https://scholar.google.com.tw/citations?view_op=view_citation&hl=zh-TW&user=TSoiF94AAAAJ&citation_for_view=TSoiF94AAAAJ:MXK_kJrjxJIC',
        citations: 25,
        scholarId: 'MXK_kJrjxJIC',
      },
      {
        title: 'ML-based joint Doppler estimation and compensation in underwater acoustic communications',
        publication:
          'Proceedings of the 16th International Conference on Underwater Networks and Systems (WUWNet)',
        year: 2022,
        url: 'https://scholar.google.com.tw/citations?view_op=view_citation&hl=zh-TW&user=TSoiF94AAAAJ&citation_for_view=TSoiF94AAAAJ:eQOLeE2rZwMC',
        citations: 21,
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
      'Spatial self-interference cancellation for full-duplex acoustic communication',
      'Joint Doppler estimation and compensation using machine-learning methods',
      'Experimental validation in underwater acoustic channels',
      'Related work published in Journal of Communications and Networks, IEEE MASS, and ACM WUWNet',
    ],
    impact:
      'Addresses interference and channel variation that limit simultaneous transmission and reception in underwater acoustic networks.',
  },
];
