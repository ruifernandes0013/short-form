import { auth } from "@/auth";
import { LoginPage } from "@/components/LoginPage";
import { AppShell } from "@/components/AppShell";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/plans";
import { Plan } from "@/types";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    return <LoginPage />;
  }

  const [balance, subscription] = await Promise.all([
    prisma.creditBalance.findUnique({
      where: { userId: session.user.id },
      select: { monthlyCredits: true, bonusCredits: true },
    }),
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true },
    }),
  ]);

  const plan = (subscription?.plan ?? "FREE") as Plan;
  const rawTotal = (balance?.monthlyCredits ?? 0) + (balance?.bonusCredits ?? 0);
  // Cap displayed credits at the plan limit for FREE users so the header
  // always reflects what the plan actually allows (1 video to try).
  const total = plan === Plan.FREE
    ? Math.min(rawTotal, PLANS[Plan.FREE].creditsPerMonth)
    : rawTotal;

  return (
    <AppShell
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }}
      initialCredits={total}
      plan={plan}
    />
  );
}
