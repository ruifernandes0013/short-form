import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTmpPath } from "@/lib/tmp";
import { cutClip } from "@/lib/ffmpeg";
import { clipSchema } from "@/lib/validation";
import { deductCredits, refundCredits, InsufficientCreditsError } from "@/lib/credits";
import { ClipResult } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { jobId, filePath, clips } = clipSchema.parse(body);

    // Deduct 1 credit upfront for the whole job
    await deductCredits(userId, jobId);

    const results: ClipResult[] = [];

    try {
      for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];
        const filename = `clip-${i}.mp4`;
        const outputPath = getTmpPath(jobId, filename);

        await cutClip(filePath, outputPath, clip.start, clip.end);

        results.push({
          index: i,
          title: clip.title,
          start: clip.start,
          end: clip.end,
          filename,
          url: `/api/clips/${jobId}/${filename}`,
          duration: clip.end - clip.start,
        });
      }
    } catch (cutError) {
      // Refund on failure
      await refundCredits(userId, jobId);
      throw cutError;
    }

    return NextResponse.json({ clips: results });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: error.message }, { status: 402 });
    }
    console.error("Clip cutting error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cut clips" },
      { status: 500 }
    );
  }
}
