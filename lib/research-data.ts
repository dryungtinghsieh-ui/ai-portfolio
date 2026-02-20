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
    title: 'Analog-Digital Hybrid Neural Networks',
    shortDescription:
      'Novel architecture combining analog computing with digital neural networks for edge AI applications',
    fullDescription:
      'Pioneered hybrid neural network architectures that leverage analog signal processing for feature extraction combined with digital neural network processing. This approach achieves superior energy efficiency and latency compared to pure digital implementations, making it ideal for edge AI and IoT applications with stringent power constraints.',
    image: '/research/hybrid-nn.jpg',
    technologies: [
      'Hybrid Neural Networks',
      'Analog AI',
      'Edge AI',
      'Signal Processing',
      'Hardware Acceleration',
      'VLSI',
    ],
    publications: [
      {
        title: 'Energy-Efficient Analog-Digital Hybrid Neural Networks',
        publication: 'IEEE Journal of Solid-State Circuits',
        year: 2024,
      },
      {
        title: 'Analog Computing for Next-Generation Edge AI',
        publication: 'International Solid-State Circuits Conference (ISSCC)',
        year: 2023,
      },
    ],
    achievements: [
      '10× energy efficiency improvement vs. digital-only approaches',
      '100× reduction in latency for inference',
      'Scalable architecture from microcontroller to FPGA',
      'Patent filed for novel signal processing techniques',
    ],
    impact:
      'Enables real-time AI inference on battery-powered edge devices',
  },

  {
    id: 'spiking-neural-networks',
    title: 'Spiking Neural Networks for Signal Processing',
    shortDescription:
      'Bio-inspired neuromorphic computing approach for ultra-low power signal analysis',
    fullDescription:
      'Developed spiking neural network (SNN) models that mimic biological neurons for signal processing tasks. SNNs offer natural temporal representation and spike-based communication, significantly reducing power consumption compared to artificial neural networks. Applications include signal integrity analysis, anomaly detection, and real-time data stream processing.',
    image: '/research/snn.jpg',
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
    image: '/research/underwater-acoustic.jpg',
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

  {
    id: 'mems-simulation',
    title: 'ML-Accelerated MEMS Device Simulation',
    shortDescription:
      'Physics-informed neural networks for accelerating MEMS electromechanical simulation',
    fullDescription:
      'Developed physics-informed neural networks (PINNs) for MEMS device simulation and optimization. Combines domain knowledge of electromechanical systems with deep learning to accelerate design iteration cycles. Enables rapid optimization of resonator sensitivity, frequency response, and power consumption.',
    image: '/research/mems.jpg',
    technologies: [
      'MEMS Simulation',
      'Physics-Informed Machine Learning',
      'Neural Networks',
      'Electromechanical Modeling',
      'Optimization',
      'CAD Integration',
    ],
    publications: [
      {
        title: 'Physics-Informed Neural Networks for MEMS Design Optimization',
        publication: 'Journal of Microelectromechanical Systems',
        year: 2024,
      },
    ],
    achievements: [
      '100× acceleration vs. traditional FEA',
      'Physics constraints maintained throughout',
      'Integrated with commercial CAD tools',
      'Production-ready optimization workflows',
    ],
    impact:
      'Reduced MEMS design cycle from months to weeks',
  },
];
