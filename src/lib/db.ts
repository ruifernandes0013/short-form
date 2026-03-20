import { PrismaClient } from "@/generated/prisma/client";

// Reuse the client in dev to avoid exhausting DB connections during hot reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
