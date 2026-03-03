import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, PLANS, type PlanKey } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { plan } = await req.json() as { plan: PlanKey };
    const selectedPlan = PLANS[plan];
    if (!selectedPlan) {
      return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 });
    }
    if (!selectedPlan.priceId) {
      return NextResponse.json(
        { error: 'Stripe price ID not configured. Set STRIPE_PRO_MONTHLY_PRICE_ID or STRIPE_PRO_ANNUAL_PRICE_ID in .env.' },
        { status: 500 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: user?.stripeCustomerId ?? undefined,
      customer_email: !user?.stripeCustomerId ? (user?.email ?? session.user.email) : undefined,
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/settings?success=1`,
      cancel_url: `${appUrl}/pricing?canceled=1`,
      metadata: {
        userId: session.user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          plan,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('[stripe/checkout]', error);
    const msg = error instanceof Error ? error.message : 'Checkout failed.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
