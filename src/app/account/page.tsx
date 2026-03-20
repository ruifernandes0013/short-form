import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { AccountPage } from "@/components/AccountPage";

export default async function Account() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const [subscription, balance, usageLogs] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.creditBalance.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.usageLog.findMany({
      where: { userId: session.user.id, action: "VIDEO_GENERATED" },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <AccountPage
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }}
      subscription={subscription ? {
        plan: subscription.plan as "FREE" | "CREATOR" | "PRO",
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
      } : null}
      credits={{
        monthly: balance?.monthlyCredits ?? 0,
        bonus: balance?.bonusCredits ?? 0,
        lastResetAt: balance?.lastResetAt?.toISOString() ?? null,
      }}
      videosGenerated={usageLogs.length}
    />
  );
}
