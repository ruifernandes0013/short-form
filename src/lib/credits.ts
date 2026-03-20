import { prisma } from "@/lib/db";
import { Plan, UsageAction } from "@/generated/prisma/client";
import { PLANS, CREDITS_PER_VIDEO } from "@/lib/plans";

export class InsufficientCreditsError extends Error {
  constructor() {
    super("Insufficient credits. Please upgrade your plan or purchase more credits.");
    this.name = "InsufficientCreditsError";
  }
}

// Initialize credit balance + subscription for a brand-new user
export async function provisionFreeUser(userId: string): Promise<void> {
  const plan = PLANS[Plan.FREE];

  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { userId },
      create: { userId, plan: Plan.FREE, status: "ACTIVE" },
      update: {},
    }),
    prisma.creditBalance.upsert({
      where: { userId },
      create: { userId, monthlyCredits: plan.creditsPerMonth, bonusCredits: 0 },
      update: {},
    }),
  ]);
}

// Quick check — does the user have at least `amount` credits?
// Use this BEFORE calling any paid API to prevent cost leakage.
export async function hasCredits(
  userId: string,
  amount: number = CREDITS_PER_VIDEO
): Promise<boolean> {
  const result = await prisma.creditBalance.findUnique({
    where: { userId },
    select: { monthlyCredits: true, bonusCredits: true },
  });
  if (!result) return false;
  return result.monthlyCredits + result.bonusCredits >= amount;
}

// Get total available credits for a user
export async function getCredits(
  userId: string
): Promise<{ monthly: number; bonus: number; total: number }> {
  const balance = await prisma.creditBalance.findUnique({ where: { userId } });
  if (!balance) return { monthly: 0, bonus: 0, total: 0 };

  return {
    monthly: balance.monthlyCredits,
    bonus: balance.bonusCredits,
    total: balance.monthlyCredits + balance.bonusCredits,
  };
}

// Atomically deduct credits for a video generation.
// Drains monthlyCredits first, then bonusCredits.
// Throws InsufficientCreditsError if the user can't afford it.
export async function deductCredits(
  userId: string,
  jobId: string,
  amount: number = CREDITS_PER_VIDEO
): Promise<void> {
  const updated = await prisma.$executeRaw`
    UPDATE "CreditBalance"
    SET
      "monthlyCredits" = GREATEST("monthlyCredits" - LEAST("monthlyCredits", ${amount}::int),  0),
      "bonusCredits"   = GREATEST("bonusCredits"   - GREATEST(${amount}::int - "monthlyCredits", 0), 0),
      "updatedAt"      = NOW()
    WHERE "userId" = ${userId}
      AND ("monthlyCredits" + "bonusCredits") >= ${amount}::int
  `;

  if (updated === 0) {
    throw new InsufficientCreditsError();
  }

  await prisma.usageLog.create({
    data: { userId, action: UsageAction.VIDEO_GENERATED, credits: amount, jobId },
  });
}

// Refund credits after a failed generation
export async function refundCredits(
  userId: string,
  jobId: string,
  amount: number = CREDITS_PER_VIDEO
): Promise<void> {
  // Refund back to monthlyCredits (simplest approach)
  await prisma.creditBalance.update({
    where: { userId },
    data: { monthlyCredits: { increment: amount } },
  });

  await prisma.usageLog.create({
    data: {
      userId,
      action: UsageAction.VIDEO_FAILED_REFUND,
      credits: -amount,
      jobId,
    },
  });
}

// Reset monthly credits at start of new billing period
export async function resetMonthlyCredits(
  userId: string,
  plan: Plan
): Promise<void> {
  const planConfig = PLANS[plan];

  await prisma.creditBalance.update({
    where: { userId },
    data: {
      monthlyCredits: planConfig.creditsPerMonth,
      lastResetAt: new Date(),
    },
  });

  await prisma.usageLog.create({
    data: {
      userId,
      action: UsageAction.MONTHLY_RESET,
      credits: -planConfig.creditsPerMonth, // negative = added
      note: `Reset to ${planConfig.creditsPerMonth} for plan ${plan}`,
    },
  });
}

// Add bonus credits after a top-up purchase
export async function addBonusCredits(
  userId: string,
  amount: number
): Promise<void> {
  await prisma.creditBalance.update({
    where: { userId },
    data: { bonusCredits: { increment: amount } },
  });

  await prisma.usageLog.create({
    data: {
      userId,
      action: UsageAction.CREDITS_PURCHASED,
      credits: -amount,
      note: `Top-up: +${amount} bonus credits`,
    },
  });
}

// Update subscription and adjust monthly credits on plan change
export async function changePlan(
  userId: string,
  newPlan: Plan,
  stripeSubscriptionId?: string,
  stripePriceId?: string
): Promise<void> {
  const planConfig = PLANS[newPlan];

  await prisma.$transaction([
    prisma.subscription.update({
      where: { userId },
      data: {
        plan: newPlan,
        status: "ACTIVE",
        stripeSubscriptionId: stripeSubscriptionId ?? undefined,
        stripePriceId: stripePriceId ?? undefined,
      },
    }),
    // Set monthly credits to the new plan amount (don't touch bonus credits)
    prisma.creditBalance.update({
      where: { userId },
      data: { monthlyCredits: planConfig.creditsPerMonth },
    }),
    prisma.usageLog.create({
      data: {
        userId,
        action: UsageAction.PLAN_CHANGED,
        credits: 0,
        note: `Changed to ${newPlan}`,
      },
    }),
  ]);
}
