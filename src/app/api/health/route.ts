import { NextResponse } from "next/server";
import { createRequire } from "module";
import fs from "fs";

const require = createRequire(import.meta.url);
const ffmpegPath: string | null = require("ffmpeg-static");

export async function GET() {
  const ffmpegOk = Boolean(ffmpegPath && fs.existsSync(ffmpegPath));

  return NextResponse.json({
    ffmpeg: ffmpegOk,
    ytdlp: true,
  });
}
