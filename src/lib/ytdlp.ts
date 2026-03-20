import ytdl from "@distube/ytdl-core";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const ffmpegPath: string = require("ffmpeg-static");

function downloadStream(
  stream: NodeJS.ReadableStream,
  dest: string,
  onProgress: (pct: number) => void,
  totalBytes?: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    let downloaded = 0;

    stream.on("data", (chunk: Buffer) => {
      downloaded += chunk.length;
      if (totalBytes && totalBytes > 0) {
        onProgress((downloaded / totalBytes) * 100);
      }
    });

    stream.pipe(file);
    stream.on("error", reject);
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
  const info = await ytdl.getInfo(url);
  const title = info.videoDetails.title
    .replace(/[^a-z0-9]/gi, "_")
    .slice(0, 50);
  const outputPath = path.join(outputDir, `${title}.mp4`);

  // Try combined format first (available for ≤360p)
  let combinedFormat;
  try {
    combinedFormat = ytdl.chooseFormat(info.formats, { filter: "audioandvideo" });
  } catch {
    combinedFormat = null;
  }

  if (combinedFormat) {
    const total = Number(combinedFormat.contentLength ?? 0);
    await downloadStream(
      ytdl.downloadFromInfo(info, { format: combinedFormat }),
      outputPath,
      (pct) => onProgress(pct, `Downloading: ${pct.toFixed(0)}%`),
      total
    );
    return outputPath;
  }

  // No combined stream — download video + audio separately, then merge
  const videoPath = path.join(outputDir, `${title}_v.mp4`);
  const audioPath = path.join(outputDir, `${title}_a.mp4`);

  const videoFormat = ytdl.chooseFormat(info.formats, {
    quality: "highestvideo",
    filter: "video",
  });
  const audioFormat = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
    filter: "audio",
  });

  const videoTotal = Number(videoFormat.contentLength ?? 0);
  const audioTotal = Number(audioFormat.contentLength ?? 0);

  onProgress(0, "Downloading video...");
  await downloadStream(
    ytdl.downloadFromInfo(info, { format: videoFormat }),
    videoPath,
    (pct) => onProgress(pct * 0.5, `Downloading: ${pct.toFixed(0)}%`),
    videoTotal
  );

  onProgress(50, "Downloading audio...");
  await downloadStream(
    ytdl.downloadFromInfo(info, { format: audioFormat }),
    audioPath,
    (pct) => onProgress(50 + pct * 0.3, `Downloading: ${(50 + pct * 0.3).toFixed(0)}%`),
    audioTotal
  );

  onProgress(82, "Merging streams...");
  await mergeVideoAudio(videoPath, audioPath, outputPath);

  fs.unlink(videoPath, () => {});
  fs.unlink(audioPath, () => {});

  return outputPath;
}
