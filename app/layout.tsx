import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Brand Bureau — Creator Deal Management',
  description: 'The editorial-grade tool for creators who run their brand deals like a business. Track deals, analyze inquiries with AI, and never leave money on the table.',
  openGraph: {
    title: 'The Brand Bureau',
    description: 'Run your brand deals like a business.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
