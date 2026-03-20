// Must import 'youtubei.js' as a server-external package (not bundled by Turbopack)
// so Node.js resolves the 'node' condition in its exports map, loading the Node platform shim.
import Innertube, { Platform } from "youtubei.js";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const ffmpegPath: string = require("ffmpeg-static");

// Override the default eval (which throws) with a working Node.js implementation.
// data.output is a self-contained JS script that ends with a top-level
// `return process(n, sp, s)`. Wrapping it in `new Function()` makes that valid.
Platform.load({
  ...Platform.shim,
  eval: (data: { output: string }) => {
    // eslint-disable-next-line no-new-func
    const fn = new Function(data.output);
    return fn() as Record<string, unknown>;
  },
});

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

async function drainStream(
  stream: ReadableStream<Uint8Array>,
  dest: string,
  onProgress: (pct: number) => void,
  totalBytes: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const reader = stream.getReader();
    let downloaded = 0;

    function pump() {
      reader.read().then(({ done, value }) => {
        if (done) {
          file.end();
          return;
        }
        file.write(Buffer.from(value));
        downloaded += value.length;
        if (totalBytes > 0) {
          onProgress(Math.min(99, (downloaded / totalBytes) * 100));
        }
        pump();
      }).catch(reject);
    }

    pump();
    file.on("finish", resolve);
    file.on("error", reject);
  });
}

function mergeVideoAudio(videoPath: string, audioPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, [
      "-i", videoPath,
      "-i", audioPath,
      "-c:v", "copy",
      "-c:a", "aac",
      "-y",
      outputPath,
    ]);
    let stderr = "";
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg merge failed (code ${code}): ${stderr.slice(-500)}`));
    });
    proc.on("error", reject);
  });
}

export async function downloadYouTube(
  url: string,
  outputDir: string,
  onProgress: (pct: number, label: string) => void
): Promise<string> {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error("Invalid YouTube URL — could not extract video ID");

  const yt = await Innertube.create({ generate_session_locally: true });
  const info = await yt.getBasicInfo(videoId);

  const title = (info.basic_info.title ?? "video")
    .replace(/[^a-z0-9]/gi, "_")
    .slice(0, 50);
  const outputPath = path.join(outputDir, `${title}.mp4`);

  // Try combined video+audio first (available for ≤360p on most videos).
  try {
    onProgress(0, "Downloading from YouTube...");
    const stream = await info.download({ type: "video+audio", quality: "best", format: "mp4" });
    await drainStream(stream, outputPath, (pct) => onProgress(pct, `Downloading: ${pct.toFixed(0)}%`), 0);
    return outputPath;
  } catch {
    // No combined format — fall through to separate streams + merge.
  }

  // Download video-only and audio-only streams, then merge.
  const videoPath = path.join(outputDir, `${title}_v.mp4`);
  const audioPath = path.join(outputDir, `${title}_a.mp4`);

  try {
    onProgress(0, "Downloading video...");
    const videoStream = await info.download({ type: "video", quality: "best", format: "mp4" });
    await drainStream(videoStream, videoPath, (pct) => onProgress(pct * 0.5, `Downloading: ${pct.toFixed(0)}%`), 0);

    onProgress(50, "Downloading audio...");
    const audioStream = await info.download({ type: "audio", quality: "best", format: "mp4" });
    await drainStream(audioStream, audioPath, (pct) => onProgress(50 + pct * 0.3, `Downloading: ${(50 + pct * 0.3).toFixed(0)}%`), 0);

    onProgress(82, "Merging streams...");
    await mergeVideoAudio(videoPath, audioPath, outputPath);
    return outputPath;
  } finally {
    fs.unlink(videoPath, () => {});
    fs.unlink(audioPath, () => {});
  }
}
