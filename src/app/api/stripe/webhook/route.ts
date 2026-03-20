import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { Plan, SubscriptionStatus } from "@prisma/client";
import { resetMonthlyCredits, addBonusCredits, changePlan } from "@/lib/credits";
import { PLANS } from "@/lib/plans";

export const runtime = "nodejs";

// Stripe requires the raw body for signature verification
export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── Idempotency — skip already-processed events ───────────────────────────
  try {
    await prisma.stripeEvent.create({ data: { id: event.id } });
  } catch {
    // Unique constraint violation = duplicate delivery, safe to ignore
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      // ── Subscription created or updated ────────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(sub);
        break;
      }

      // ── Subscription cancelled ──────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }

      // ── Invoice paid → reset monthly credits ───────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      // ── Invoice payment failed → mark past_due ─────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(invoice);
        break;
      }

      // ── One-time top-up checkout completed ──────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "payment") {
          await handleTopupCompleted(session);
        }
        break;
      }

      default:
        // Ignore unhandled events
        break;
    }
  } catch (err) {
    console.error(`Error handling webhook ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleSubscriptionChange(sub: Stripe.Subscription): Promise<void> {
  const userId = sub.metadata?.userId;
  if (!userId) return;

  const plan = parsePlanFromMetadata(sub.metadata?.plan) ?? Plan.FREE;
  const item = sub.items.data[0];
  const priceId = item?.price.id;
  const status = mapStripeStatus(sub.status);

  // In the clover API, billing period is on the subscription item
  const periodStart = item?.current_period_start
    ? new Date(item.current_period_start * 1000)
    : null;
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000)
    : null;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      plan,
      status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    update: {
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      plan,
      status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const userId = sub.metadata?.userId;
  if (!userId) return;

  // Downgrade to FREE
  await changePlan(userId, Plan.FREE);

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: SubscriptionStatus.CANCELED,
      stripeSubscriptionId: null,
      stripePriceId: null,
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  // In the clover API, subscription reference is in invoice.parent.subscription_details
  const parent = invoice.parent;
  if (parent?.type !== "subscription_details") return;

  const subRef = parent.subscription_details?.subscription;
  const subId = typeof subRef === "string" ? subRef : subRef?.id;
  if (!subId) return;

  const sub = await stripe.subscriptions.retrieve(subId);
  const userId = sub.metadata?.userId;
  if (!userId) return;

  const plan = parsePlanFromMetadata(sub.metadata?.plan) ?? Plan.FREE;
  const item = sub.items.data[0];

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: item?.current_period_start
        ? new Date(item.current_period_start * 1000)
        : undefined,
      currentPeriodEnd: item?.current_period_end
        ? new Date(item.current_period_end * 1000)
        : undefined,
    },
  });

  await resetMonthlyCredits(userId, plan);
}

async function handleInvoiceFailed(invoice: Stripe.Invoice): Promise<void> {
  const parent = invoice.parent;
  if (parent?.type !== "subscription_details") return;

  const subRef = parent.subscription_details?.subscription;
  const subId = typeof subRef === "string" ? subRef : subRef?.id;
  if (!subId) return;

  const sub = await stripe.subscriptions.retrieve(subId);
  const userId = sub.metadata?.userId;
  if (!userId) return;

  await prisma.subscription.update({
    where: { userId },
    data: { status: SubscriptionStatus.PAST_DUE },
  });
}

async function handleTopupCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  const credits = Number(session.metadata?.credits ?? 0);

  if (!userId || !credits) return;

  await addBonusCredits(userId, credits);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePlanFromMetadata(value?: string): Plan | null {
  if (value && Object.keys(PLANS).includes(value)) {
    return value as Plan;
  }
  return null;
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
      return SubscriptionStatus.ACTIVE;
    case "past_due":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
    case "unpaid":
      return SubscriptionStatus.CANCELED;
    default:
      return SubscriptionStatus.INCOMPLETE;
  }
}
