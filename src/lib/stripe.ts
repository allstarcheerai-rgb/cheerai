import Stripe from 'stripe';

// Lazy-initialised so the app boots even without Stripe keys configured.
// Stripe routes will throw with a clear message if keys are missing.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.startsWith('sk_test_placeholder')) {
      throw new Error('STRIPE_SECRET_KEY is not configured. Add a real Stripe key to .env.');
    }
    _stripe = new Stripe(key, { apiVersion: '2024-04-10', typescript: true });
  }
  return _stripe;
}

// Re-export as `stripe` for backward compatibility in route files
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string, unknown>)[prop as string];
  },
});

export const PLANS = {
  pro_monthly: {
    name: 'Pro Monthly',
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
    amount: 1900, // cents
    interval: 'month' as const,
  },
  pro_annual: {
    name: 'Pro Annual',
    priceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? '',
    amount: 14900, // cents
    interval: 'year' as const,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
