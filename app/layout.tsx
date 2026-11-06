import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CitationProvider } from '@/components/citation-provider';

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
    default: 'Dr. Yung-Ting Hsieh | Signal Integrity & Applied AI',
    template: '%s | Dr. Yung-Ting Hsieh',
  },
  description:
    'Yung-Ting Hsieh, Ph.D. — signal integrity engineer working on high-speed interconnects, physics-based modeling, and applied AI for engineering.',
  openGraph: {
    title: 'Dr. Yung-Ting Hsieh | Signal Integrity & Applied AI',
    description:
      'Yung-Ting Hsieh, Ph.D. — signal integrity engineer working on high-speed interconnects, physics-based modeling, and applied AI for engineering.',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr. Yung-Ting Hsieh | Signal Integrity & Applied AI',
    description:
      'Yung-Ting Hsieh, Ph.D. — signal integrity engineer working on high-speed interconnects, physics-based modeling, and applied AI for engineering.',
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
        <CitationProvider>{children}</CitationProvider>
      </body>
    </html>
  );
}
