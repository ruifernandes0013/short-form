import { auth } from "@/auth";
import { LoginPage } from "@/components/LoginPage";
import { AppShell } from "@/components/AppShell";
import { prisma } from "@/lib/db";

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

  const total = (balance?.monthlyCredits ?? 0) + (balance?.bonusCredits ?? 0);

  return (
    <AppShell
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }}
      initialCredits={total}
      plan={(subscription?.plan ?? "FREE") as "FREE" | "CREATOR" | "PRO"}
    />
  );
}
