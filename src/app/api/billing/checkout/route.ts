import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe";
import { PLANS } from "@/lib/plans";
import { Plan } from "@prisma/client";
import { z } from "zod";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  plan: z.enum([Plan.CREATOR, Plan.PRO]),
});

// POST /api/billing/checkout — create a Stripe Checkout session for a subscription
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = checkoutSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planConfig = PLANS[body.data.plan];
  if (!planConfig.stripePriceId) {
    return NextResponse.json({ error: "Plan not configured" }, { status: 500 });
  }

  const customerId = await getOrCreateStripeCustomer(
    session.user.id,
    session.user.email,
    session.user.name
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?upgraded=1`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: { userId: session.user.id, plan: body.data.plan },
    subscription_data: {
      metadata: { userId: session.user.id, plan: body.data.plan },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
