import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PLANS, TOPUP } from "@/lib/plans";
import { Plan } from "@prisma/client";

export const runtime = "nodejs";

// GET /api/billing/plans — returns all plans + the user's current plan
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: { plan: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true },
  });

  return NextResponse.json({
    plans: Object.values(PLANS),
    topup: TOPUP,
    current: subscription ?? { plan: Plan.FREE, status: "ACTIVE" },
  });
}
