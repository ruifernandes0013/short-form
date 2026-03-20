import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCredits } from "@/lib/credits";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/billing/credits — returns the user's credit balance
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [credits, subscription] = await Promise.all([
    getCredits(session.user.id),
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true, currentPeriodEnd: true },
    }),
  ]);

  return NextResponse.json({
    ...credits,
    plan: subscription?.plan ?? "FREE",
    renewsAt: subscription?.currentPeriodEnd ?? null,
  });
}
