import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { identifyClips } from "@/lib/claude";
import { generateSchema } from "@/lib/validation";
import { hasCredits, InsufficientCreditsError } from "@/lib/credits";
import { rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

const RATE_LIMIT = 5;

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // ── Rate limit ────────────────────────────────────────────────────────────
  const rl = rateLimit(`generate:${userId}`, RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Wait a moment before trying again." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  // ── Credit gate ───────────────────────────────────────────────────────────
  const creditOk = await hasCredits(userId);
  if (!creditOk) {
    throw new InsufficientCreditsError();
  }

  try {
    const body = await request.json();
    const { segments } = generateSchema.parse(body);

    const clips = await identifyClips(segments);

    return NextResponse.json({ clips });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: error.message }, { status: 402 });
    }
    console.error("Clip identification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to identify clips" },
      { status: 500 }
    );
  }
}
