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
  const planLimit = PLANS[Plan.FREE].creditsPerMonth; // 1

  // Correct stale DB values: if a FREE user somehow has more credits than their
  // plan allows (e.g. provisioned before the limit was reduced), fix it now.
  if (plan === Plan.FREE && rawTotal > planLimit) {
    await prisma.creditBalance.update({
      where: { userId: session.user.id },
      data: { monthlyCredits: planLimit, bonusCredits: 0 },
    });
  }

  const total = plan === Plan.FREE ? Math.min(rawTotal, planLimit) : rawTotal;

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
