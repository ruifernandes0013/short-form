import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PricingPage } from "@/components/PricingPage";
import { Plan } from "@/types";

export default async function PricingRoute() {
  const session = await auth();

  let currentPlan: Plan = Plan.FREE;
  if (session?.user?.id) {
    const sub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true },
    });
    if (sub) currentPlan = sub.plan as Plan;
  }

  return <PricingPage currentPlan={currentPlan} />;
}
