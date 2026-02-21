import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dryungtinghsieh-ui.github.io/ai-portfolio'),
  title: {
    default: 'Dr. Yung-Ting Hsieh | AI Research Portfolio',
    template: '%s | Dr. Yung-Ting Hsieh',
  },
  description:
    'AI-Assisted Signal Integrity Engineer and researcher focused on hybrid neural networks, S-parameter prediction, and engineering AI workflows.',
  openGraph: {
    title: 'Dr. Yung-Ting Hsieh | AI Research Portfolio',
    description:
      'AI-Assisted Signal Integrity Engineer and researcher focused on hybrid neural networks, S-parameter prediction, and engineering AI workflows.',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr. Yung-Ting Hsieh | AI Research Portfolio',
    description:
      'AI-Assisted Signal Integrity Engineer and researcher focused on hybrid neural networks, S-parameter prediction, and engineering AI workflows.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
