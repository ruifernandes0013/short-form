import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  const [ffmpegResult, ytdlpResult] = await Promise.allSettled([
    execAsync("which ffmpeg || where ffmpeg"),
    execAsync("which yt-dlp || where yt-dlp"),
  ]);

  return NextResponse.json({
    ffmpeg: ffmpegResult.status === "fulfilled",
    ytdlp: ytdlpResult.status === "fulfilled",
  });
}
