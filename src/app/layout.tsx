import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/store/StoreProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Pulse - Personalized Content Dashboard',
  description: 'Track, discover, and organize personalized news, entertainment recommendations, and real-time social conversations with customizable feeds.',
  keywords: ['personalized dashboard', 'content feed', 'news', 'recommendations', 'social media', 'react', 'nextjs', 'redux toolkit'],
  authors: [{ name: 'SDE Intern Candidate' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
