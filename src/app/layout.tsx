import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './global.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dashboard Akreditasi STEI ITB',
  description: 'Sistem Terintegrasi Repository dan Dashboard Data Akreditasi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='id'>
      <body className={inter.className}>{children}</body>
    </html>
  );
}