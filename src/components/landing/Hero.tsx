import Link from 'next/link';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient min-h-[90vh] flex items-center">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
          <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
          <span>AI-powered marketing for all-star cheer gyms</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
          Your gym&apos;s marketing{' '}
          <span className="relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-amber-300">
              on autopilot
            </span>
          </span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-xl text-white/75 leading-relaxed">
          Generate competition flyers, Instagram content, practice plans, and score sheet explanations
          in seconds. Built by cheer people, for cheer people.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <Sparkles className="h-5 w-5" />
            Start Free — No Credit Card
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
          >
            See what it does
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-10 text-sm text-white/50">
          Trusted by coaches at 🏆 gyms across the country
        </p>

        {/* Feature preview pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {[
            '✨ Caption Generator',
            '📅 Content Calendar',
            '🏋️ Practice Planner',
            '📊 Score Translator',
            '📝 Routine Notes',
            '💾 Project Library',
          ].map((feature) => (
            <span
              key={feature}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-sm"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
