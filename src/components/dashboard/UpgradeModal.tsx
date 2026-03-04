'use client';

import { useState } from 'react';
import { Crown, Zap, Check, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  reason?: string;
}

const PRO_FEATURES = [
  'Unlimited AI generations',
  'Practice Planner & Score Translator',
  'AI Image Generator',
  'Project Library (save & export)',
  'Custom template creation',
  'Priority support',
];

export function UpgradeModal({ open, onClose, reason }: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(plan: 'pro_monthly' | 'pro_annual') {
    setLoading(plan);
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
      setLoading(null);
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="text-center mb-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-pink-500 mx-auto mb-3">
          <Crown className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Upgrade to Pro</h2>
        {reason && (
          <p className="mt-1.5 text-sm text-gray-500">{reason}</p>
        )}
        {!reason && (
          <p className="mt-1.5 text-sm text-gray-500">
            Unlock the full Cheer AI toolkit and generate without limits.
          </p>
        )}
      </div>

      <ul className="space-y-2 mb-6">
        {PRO_FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 flex-shrink-0">
              <Check className="h-3 w-3 text-brand-600" />
            </div>
            {f}
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xs font-semibold text-gray-500 mb-1">MONTHLY</p>
          <p className="text-2xl font-extrabold text-gray-900">
            $19<span className="text-sm font-normal text-gray-500">/mo</span>
          </p>
          <Button
            fullWidth
            variant="secondary"
            size="sm"
            className="mt-3"
            loading={loading === 'pro_monthly'}
            onClick={() => handleUpgrade('pro_monthly')}
          >
            Get Monthly
          </Button>
        </div>
        <div className="rounded-xl border-2 border-brand-400 bg-brand-50 p-4 text-center relative">
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
            <span className="text-[10px] font-bold bg-brand-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
              SAVE $79/YR
            </span>
          </div>
          <p className="text-xs font-semibold text-brand-600 mb-1">ANNUAL</p>
          <p className="text-2xl font-extrabold text-brand-900">
            $149<span className="text-sm font-normal text-brand-600">/yr</span>
          </p>
          <Button
            fullWidth
            size="sm"
            className="mt-3"
            loading={loading === 'pro_annual'}
            onClick={() => handleUpgrade('pro_annual')}
          >
            <Zap className="h-3.5 w-3.5" /> Best Value
          </Button>
        </div>
      </div>

      <button
        onClick={onClose}
        className="mt-4 w-full text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        Maybe later
      </button>
    </Modal>
  );
}
