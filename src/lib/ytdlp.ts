import ytdl from "@distube/ytdl-core";
import path from "path";
import fs from "fs";

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

  // Pick best format that has both video and audio in a single file
  const format = ytdl.chooseFormat(info.formats, {
    quality: "highestvideo",
    filter: "audioandvideo",
  });

  const totalBytes = Number(format.contentLength ?? 0);

  await new Promise<void>((resolve, reject) => {
    const stream = ytdl.downloadFromInfo(info, { format });
    const file = fs.createWriteStream(outputPath);
    let downloaded = 0;

    stream.on("data", (chunk: Buffer) => {
      downloaded += chunk.length;
      if (totalBytes > 0) {
        const pct = (downloaded / totalBytes) * 100;
        onProgress(pct, `Downloading: ${pct.toFixed(1)}%`);
      }
    });

    stream.pipe(file);
    stream.on("error", reject);
    file.on("finish", resolve);
    file.on("error", reject);
  });

  return outputPath;
}
