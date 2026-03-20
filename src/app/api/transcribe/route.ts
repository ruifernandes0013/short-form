import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTmpPath } from "@/lib/tmp";
import { extractAudio, assertDurationAllowed } from "@/lib/ffmpeg";
import { transcribeAudio } from "@/lib/whisper";
import { transcribeSchema } from "@/lib/validation";
import { hasCredits, InsufficientCreditsError } from "@/lib/credits";
import { rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 300;

// Max 5 transcription jobs per user per minute to prevent runaway costs
const RATE_LIMIT = 5;

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // ── Rate limit ────────────────────────────────────────────────────────────
  const rl = rateLimit(`transcribe:${userId}`, RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Wait a moment before trying again." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  // ── Credit gate — check BEFORE any paid API call ──────────────────────────
  const creditOk = await hasCredits(userId);
  if (!creditOk) {
    throw new InsufficientCreditsError();
  }

  try {
    const body = await request.json();
    const { jobId, filePath } = transcribeSchema.parse(body);

    // ── Duration guard — reject long videos before sending to Whisper ─────
    await assertDurationAllowed(filePath);

    const audioPath = getTmpPath(jobId, "audio.mp3");

    await extractAudio(filePath, audioPath);
    const { text: transcript, segments } = await transcribeAudio(audioPath);

    return NextResponse.json({ transcript, segments });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: error.message }, { status: 402 });
    }
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
