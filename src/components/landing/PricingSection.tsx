import Link from 'next/link';
import { Check, Crown, Zap } from 'lucide-react';

const FREE_FEATURES = [
  '5 AI generations per month',
  'Marketing Generator',
  'Brand Pack library',
  'Copy to clipboard',
];

const PRO_FEATURES = [
  'Unlimited AI generations',
  'Marketing Generator',
  'Practice Planner',
  'Score Sheet Translator',
  'Routine Notes Formatter',
  'Project Library (save & search)',
  'Export as .txt / .md',
  'All Brand Packs + new releases',
  'Priority support',
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Free</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-gray-500 text-sm">/forever</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Try it out. No credit card needed.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full rounded-xl border-2 border-gray-200 py-3 text-center text-sm font-bold text-gray-700 hover:border-brand-400 hover:text-brand-600 transition-all"
            >
              Get started free
            </Link>
          </div>

          {/* Pro Monthly — featured */}
          <div className="relative rounded-2xl bg-gradient-to-b from-brand-600 to-brand-800 p-8 shadow-xl shadow-brand-200 scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-900">
                <Crown className="h-3 w-3" /> Most Popular
              </span>
            </div>
            <div className="mb-6">
              <p className="text-sm font-semibold text-white/70 uppercase tracking-wide">Pro</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$19</span>
                <span className="text-white/60 text-sm">/month</span>
              </div>
              <p className="mt-2 text-sm text-white/70">Full access. Cancel anytime.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white">
                  <Check className="h-4 w-4 text-green-300 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full rounded-xl bg-white py-3 text-center text-sm font-bold text-brand-700 hover:bg-gray-50 transition-all shadow-lg"
            >
              Start Pro
            </Link>
          </div>

          {/* Annual */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Annual</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-900">$149</span>
                <span className="text-gray-500 text-sm">/year</span>
              </div>
              <p className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 fill-green-500" /> Save $79 vs monthly
              </p>
            </div>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full rounded-xl border-2 border-brand-200 bg-brand-50 py-3 text-center text-sm font-bold text-brand-700 hover:bg-brand-100 transition-all"
            >
              Get Annual Pro
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
