import Groq from "groq-sdk";
import fs from "fs";
import { TimedSegment } from "@/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MAX_WHISPER_BYTES = 25 * 1024 * 1024; // 25MB

export interface TranscribeResult {
  text: string;
  segments: TimedSegment[];
}

export async function transcribeAudio(audioPath: string): Promise<TranscribeResult> {
  const stats = fs.statSync(audioPath);

  if (stats.size > MAX_WHISPER_BYTES) {
    throw new Error(
      `Audio file is ${(stats.size / 1024 / 1024).toFixed(1)}MB — exceeds Whisper's 25MB limit. Try a shorter video.`
    );
  }

  const response = await groq.audio.transcriptions.create({
    model: "whisper-large-v3-turbo",
    file: fs.createReadStream(audioPath),
    response_format: "verbose_json",
  }) as unknown as { text: string; segments: Array<{ start: number; end: number; text: string }> };

  return {
    text: response.text,
    segments: response.segments.map((s) => ({
      start: s.start,
      end: s.end,
      text: s.text.trim(),
    })),
  };
}
