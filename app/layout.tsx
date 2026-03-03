import './globals.css';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://evnx.dev'),
  title: {
    template: '%s | evnx',
    default: 'evnx — .env management CLI',
  },
  description: 'Rust-powered CLI for validating, scanning, and converting .env files. Stop leaking secrets.',
  keywords: ['env management', 'secret scanning', 'dotenv', 'cli tool', 'rust', 'devops', 'security'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://evnx.dev',
    siteName: 'evnx',
    title: 'evnx — .env management CLI',
    description: 'Rust-powered CLI for validating, scanning, and converting .env files.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'evnx',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@urwithajit9',
    title: 'evnx — .env management CLI',
    description: 'Rust-powered CLI for validating, scanning, and converting .env files.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
