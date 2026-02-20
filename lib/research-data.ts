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
  }[];
  achievements?: string[];
  impact?: string;
}

export const researchProjects: ResearchProject[] = [
  {
    id: 'ai-s-parameter-prediction',
    title: 'AI-Assisted S-Parameter Prediction',
    shortDescription:
      'Machine learning framework for S-parameter prediction achieving 4000× computational acceleration',
    fullDescription:
      'Developed a comprehensive ML pipeline that predicts S-parameters for high-speed interconnect systems. This breakthrough approach reduced electromagnetic simulation time from hours to milliseconds, delivering exceptional accuracy with only 4% prediction error. The innovation resulted in $12.5M USD capital savings by enabling rapid design iterations without expensive physical prototyping.',
    image: '/research/AI-Spara.jpg',
    technologies: [
      'TensorFlow',
      'PyTorch',
      'Signal Processing',
      'S-Parameters',
      'Deep Learning',
      'High-Speed Interconnects',
    ],
    achievements: [
      '4000× computational acceleration over traditional EM simulators',
      '4% prediction error maintains design reliability',
      '$12.5M capital savings through faster iterations',
      'Deployed in production at TE Connectivity',
    ],
    impact:
      'Transformed design cycle from weeks to hours, enabling rapid prototyping and cost optimization',
  },

  {
    id: 'hybrid-neural-networks',
    title: 'Ultra-low Power Analog Folded Neural Network for Cardiovascular Health Monitoring',
    shortDescription:
      'Batteryless wearable ECG monitoring using serialized analog folded neural network for continuous health screening',
    fullDescription:
      'Introduced an ultra-low power analog Folded Neural Network (FNN) for physiological signal processing in a batteryless fashion. By serializing computation, the proposed FNN provides significant benefits over traditional analog implementations, including lower space, reduced power consumption, and lower peak-to-average power ratio. The system leverages distributed sensing and analog computation to enable continuous ECG-based cardiovascular health monitoring on wearable devices without battery dependency. Extensive evaluation on ECG datasets demonstrates optimal performance at 6 layers with hidden size of 30, achieving accurate anomaly detection suitable for early diagnosis of myocardial infarction and cardiomyopathy/heart failure in both clinical and pre-clinical environments.',
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
    achievements: [
      'Batteryless operation through serialized computation',
      'Optimized 6-layer architecture with hidden size 30',
      'Enables continuous health monitoring on wearable devices',
      'Superior accuracy in ECG-based cardiovascular anomaly detection',
      'Minimal thermal noise and spatial requirements',
      'Reduced peak-to-average power ratio vs. traditional analog implementations',
    ],
    impact:
      'Transforms continuous cardiovascular health monitoring by enabling batteryless wearable devices for early disease detection',
  },

  {
    id: 'spiking-neural-networks',
    title: 'Spiking Neural Networks for Signal Processing',
    shortDescription:
      'Bio-inspired neuromorphic computing approach for ultra-low power signal analysis',
    fullDescription:
      'Developed spiking neural network (SNN) models that mimic biological neurons for signal processing tasks. SNNs offer natural temporal representation and spike-based communication, significantly reducing power consumption compared to artificial neural networks. Applications include signal integrity analysis, anomaly detection, and real-time data stream processing.',
    image: '/research/Synapse_overview_eqCircuit.jpg',
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
        title: 'Spiking Neural Networks for TDR Signal Interpretation',
        publication: 'IEEE Transactions on Neural Networks and Learning Systems',
        year: 2024,
      },
      {
        title: 'Bio-Inspired Signal Processing on Neuromorphic Hardware',
        publication: 'Neuromorphic Computing and Engineering',
        year: 2023,
      },
    ],
    achievements: [
      '1000× power reduction vs. conventional DNNs',
      'Real-time signal processing capability',
      'Demonstrated on Intel Loihi neuromorphic hardware',
      'Unique temporal feature extraction',
    ],
    impact:
      'Enables always-on signal monitoring on battery-powered devices',
  },

  {
    id: 'underwater-acoustic-communications',
    title: 'Full-Duplex Underwater Acoustic Communications',
    shortDescription:
      'Real-time two-way underwater robot conversations using acoustic self-interference cancellation in space',
    fullDescription:
      'Revolutionary underwater communication system enabling robots and AUVs to talk and listen simultaneously. Like having a real-time conversation underwater, this system transmits and receives acoustic signals at the same time using advanced acoustic vector sensors and spatial interference cancellation. By eliminating self-echo through innovative signal processing techniques, it achieves true full-duplex communications—doubling channel efficiency compared to traditional half-duplex systems. Perfect for deep-sea exploration networks, autonomous underwater vehicle coordination, and ocean monitoring systems where real-time data exchange is critical.',
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
        title: 'Full-Duplex Underwater Acoustic Communications via Self-Interference Cancellation in Space',
        publication: 'Journal of Communications and Networks',
        year: 2023,
      },
    ],
    achievements: [
      '2× bandwidth efficiency vs. traditional half-duplex systems',
      'Real-time bidirectional communication underwater',
      'Adaptive steering angle adjustment via integrated protocol',
      'Validated in real underwater acoustic channels',
      'Supports advanced phased array beam forming',
    ],
    impact:
      'Transforms underwater robotics enables simultaneous communication for coordinated deep-sea operations and real-time ocean monitoring networks',
  },
];
