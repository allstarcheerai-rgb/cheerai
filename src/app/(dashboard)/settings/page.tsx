'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, Crown, CreditCard, User, Zap, Check } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session } = useSession();
  const isPro = session?.user?.subscription === 'pro' || session?.user?.subscription === 'annual';
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleUpgrade(plan: 'pro_monthly' | 'pro_annual') {
    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed.');
      window.location.href = data.url;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
          <Settings className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings & Billing</h1>
          <p className="text-sm text-gray-500">Manage your account and subscription.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Account info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-700">Account</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{session?.user?.name ?? 'Athlete'}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
              <Badge variant={isPro ? 'pro' : 'free'}>
                {isPro ? '✨ Pro' : 'Free'}
              </Badge>
            </div>
          </CardBody>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-700">Subscription</h2>
            </div>
          </CardHeader>
          <CardBody>
            {isPro ? (
              <div className="rounded-xl bg-gradient-to-r from-brand-50 to-pink-50 border border-brand-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="h-5 w-5 text-brand-600" />
                  <span className="font-semibold text-brand-900">
                    You&apos;re on Pro {session?.user?.subscription === 'annual' ? '(Annual)' : '(Monthly)'}
                  </span>
                </div>
                <ul className="space-y-1.5 text-sm text-brand-800">
                  {['Unlimited AI generations', 'All generator tools', 'Project Library', 'Export & copy'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-brand-600" /> {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-brand-600">
                  To manage or cancel your subscription, visit the{' '}
                  <a href="https://billing.stripe.com/p/login/test_00g00000000000" target="_blank" rel="noopener noreferrer" className="underline">
                    Stripe billing portal
                  </a>
                  .
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  You&apos;re on the <strong>Free plan</strong> — 5 AI generations/month. Upgrade to Pro for unlimited generations and all tools.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-sm font-bold text-gray-900 mb-1">Pro Monthly</p>
                    <p className="text-2xl font-extrabold text-gray-900 mb-3">
                      $19<span className="text-sm font-normal text-gray-500">/mo</span>
                    </p>
                    <Button
                      fullWidth
                      loading={loadingPlan === 'pro_monthly'}
                      onClick={() => handleUpgrade('pro_monthly')}
                    >
                      Upgrade Monthly
                    </Button>
                  </div>
                  <div className="rounded-xl border-2 border-brand-400 bg-brand-50 p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="text-sm font-bold text-brand-900">Pro Annual</p>
                      <span className="text-[10px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded-full">
                        SAVE $79
                      </span>
                    </div>
                    <p className="text-2xl font-extrabold text-brand-900 mb-3">
                      $149<span className="text-sm font-normal text-brand-600">/yr</span>
                    </p>
                    <Button
                      fullWidth
                      variant="secondary"
                      loading={loadingPlan === 'pro_annual'}
                      onClick={() => handleUpgrade('pro_annual')}
                    >
                      <Zap className="h-4 w-4" /> Best Value
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Danger zone */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-red-600">Danger Zone</h2>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-gray-600 mb-3">
              Delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="danger" size="sm" disabled>
              Delete Account (contact support)
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
