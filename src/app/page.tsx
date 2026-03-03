import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { PricingSection } from '@/components/landing/PricingSection';
import { Testimonials } from '@/components/landing/Testimonials';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Cheer AI
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-white/80 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-white/80 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-white/80 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white hover:bg-white/25 transition-all"
            >
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
          <Link
            href="/register"
            className="md:hidden inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-2 text-sm font-semibold text-white"
          >
            Start free
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <Features />
        <Testimonials />
        <PricingSection />

        {/* CTA Banner */}
        <section className="bg-hero-gradient py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to take your gym&apos;s content to the next level?
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Join coaches building better-looking gyms with less effort.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <Sparkles className="h-5 w-5" />
              Create your free account
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white font-bold">
              <div className="flex h-6 w-6 items-center justify-center rounded gradient-brand">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              Cheer AI
            </div>
            <p className="text-sm">© {new Date().getFullYear()} Cheer AI. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
