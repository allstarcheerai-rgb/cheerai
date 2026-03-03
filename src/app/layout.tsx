import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Cheer AI — Marketing & Tools for All-Star Gyms',
    template: '%s | Cheer AI',
  },
  description:
    'Generate cheer marketing assets, practice plans, score sheet explanations, and more. Built for all-star cheer coaches, athletes, and parents.',
  keywords: ['cheerleading', 'all-star cheer', 'cheer marketing', 'cheer AI', 'cheer tools'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                borderRadius: '10px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#a855f7', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
