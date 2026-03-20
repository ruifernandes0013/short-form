import { spawn } from "child_process";
import ffmpegStatic from "ffmpeg-static";

// Use bundled binary (works on Vercel) unless overridden by env var
const FFMPEG_PATH = process.env.FFMPEG_PATH || ffmpegStatic || "ffmpeg";
const FFPROBE_PATH = process.env.FFPROBE_PATH || "ffprobe";

// Max video length allowed for transcription (default 30 min)
const MAX_DURATION_SECONDS = Number(process.env.MAX_VIDEO_SECONDS ?? 1800);

export class VideoTooLongError extends Error {
  constructor(durationSeconds: number) {
    const mins = Math.round(durationSeconds / 60);
    const max = Math.round(MAX_DURATION_SECONDS / 60);
    super(`Video is ${mins} min — maximum is ${max} min.`);
    this.name = "VideoTooLongError";
  }
}

// Use ffprobe to read duration without decoding the video
export function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const args = [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath,
    ];

    const proc = spawn(FFPROBE_PATH, args);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe failed: ${stderr}`));
        return;
      }
      const seconds = parseFloat(stdout.trim());
      if (isNaN(seconds)) {
        reject(new Error("Could not read video duration"));
        return;
      }
      resolve(seconds);
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn ffprobe: ${err.message}`));
    });
  });
}

export async function assertDurationAllowed(filePath: string): Promise<void> {
  const duration = await getVideoDuration(filePath);
  if (duration > MAX_DURATION_SECONDS) {
    throw new VideoTooLongError(duration);
  }
}

export function cutClip(
  inputPath: string,
  outputPath: string,
  start: number,
  end: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      "-ss", String(start),
      "-i", inputPath,
      "-t", String(end - start),
      "-c", "copy",
      "-y",
      outputPath,
    ];

    const proc = spawn(FFMPEG_PATH, args);
    let stderr = "";

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg clip failed (code ${code}): ${stderr}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn ffmpeg: ${err.message}`));
    });
  });
}


export function extractAudio(
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      "-i",
      inputPath,
      "-vn", // no video
      "-acodec",
      "libmp3lame",
      "-ar",
      "16000", // 16kHz — optimal for Whisper
      "-ac",
      "1", // mono
      "-b:a",
      "64k",
      "-y", // overwrite
      outputPath,
    ];

    const proc = spawn(FFMPEG_PATH, args);
    let stderr = "";

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn ffmpeg: ${err.message}. Make sure ffmpeg is installed (brew install ffmpeg)`));
    });
  });
}
