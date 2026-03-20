import { spawn } from "child_process";
import path from "path";

const YTDLP_PATH = process.env.YTDLP_PATH || "yt-dlp";

export function downloadYouTube(
  url: string,
  outputDir: string,
  onProgress: (pct: number, label: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputTemplate = path.join(outputDir, "%(title).50s.%(ext)s");

    const args = [
      url,
      "--output",
      outputTemplate,
      "--format",
      "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
      "--merge-output-format",
      "mp4",
      "--progress",
      "--newline",
      "--no-playlist",
    ];

    const proc = spawn(YTDLP_PATH, args);
    let stderr = "";
    let downloadedFile = "";

    proc.stdout.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        // Parse progress: [download]  42.3% of ~123.45MiB at  1.23MiB/s ETA 00:12
        const progressMatch = line.match(/\[download\]\s+([\d.]+)%/);
        if (progressMatch) {
          const pct = parseFloat(progressMatch[1]);
          onProgress(pct, `Downloading: ${pct.toFixed(1)}%`);
        }

        // Capture output filename
        const destMatch = line.match(/\[download\] Destination: (.+)$/);
        if (destMatch) {
          downloadedFile = destMatch[1].trim();
        }

        // Merged file
        const mergeMatch = line.match(/\[Merger\] Merging formats into "(.+)"$/);
        if (mergeMatch) {
          downloadedFile = mergeMatch[1].trim();
        }
      }
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        if (downloadedFile) {
          resolve(downloadedFile);
        } else {
          // Fallback: find the most recent file in outputDir
          reject(new Error("yt-dlp finished but could not determine output file"));
        }
      } else {
        reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
      }
    });

    proc.on("error", (err) => {
      reject(
        new Error(
          `Failed to spawn yt-dlp: ${err.message}. Make sure yt-dlp is installed (brew install yt-dlp)`
        )
      );
    });
  });
}
