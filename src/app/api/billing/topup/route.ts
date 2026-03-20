import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe";
import { TOPUP } from "@/lib/plans";

export const runtime = "nodejs";

// POST /api/billing/topup — create a one-time Stripe Checkout session for credit top-up
export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!TOPUP.stripePriceId) {
    return NextResponse.json({ error: "Top-up not configured" }, { status: 500 });
  }

  const customerId = await getOrCreateStripeCustomer(
    session.user.id,
    session.user.email,
    session.user.name
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [{ price: TOPUP.stripePriceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?topup=1`,
    cancel_url: `${baseUrl}/dashboard`,
    metadata: { userId: session.user.id, type: "topup", credits: String(TOPUP.credits) },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
