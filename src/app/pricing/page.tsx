import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { PricingSection } from '@/components/landing/PricingSection';

export const metadata: Metadata = {
  title: 'Pricing',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Cheer AI
          </Link>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </div>
      </header>

      <PricingSection />

      <div className="text-center pb-16">
        <p className="text-sm text-gray-500">
          Questions?{' '}
          <a href="mailto:hello@cheerai.app" className="text-brand-600 hover:underline">
            hello@cheerai.app
          </a>
        </p>
      </div>
    </div>
  );
}
