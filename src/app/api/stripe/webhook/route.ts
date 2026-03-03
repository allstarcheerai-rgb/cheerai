import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import type Stripe from 'stripe';

// Disable body parsing — Stripe requires the raw body for signature verification
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan; // "pro_monthly" | "pro_annual"

        if (!userId) break;

        const subscription = plan === 'pro_annual' ? 'annual' : 'pro';

        await db.user.update({
          where: { id: userId },
          data: {
            subscription,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });
        console.log(`[webhook] User ${userId} upgraded to ${subscription}`);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        const isActive = sub.status === 'active' || sub.status === 'trialing';
        const plan = sub.metadata?.plan === 'pro_annual' ? 'annual' : 'pro';

        await db.user.update({
          where: { id: userId },
          data: {
            subscription: isActive ? plan : 'free',
            stripeSubscriptionId: sub.id,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await db.user.update({
          where: { id: userId },
          data: { subscription: 'free', stripeSubscriptionId: null },
        });
        console.log(`[webhook] User ${userId} downgraded to free`);
        break;
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('[webhook] Handler error:', error);
    return NextResponse.json({ error: 'Webhook handler error.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
