import { z } from "zod";

export const youtubeUrlSchema = z.object({
  url: z
    .string()
    .url()
    .refine(
      (url) =>
        /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/.test(
          url
        ),
      { message: "Must be a valid YouTube URL" }
    ),
});

export const transcribeSchema = z.object({
  jobId: z.string().uuid(),
  filePath: z.string(),
});

const timedSegmentSchema = z.object({
  start: z.number(),
  end: z.number(),
  text: z.string(),
});

export const generateSchema = z.object({
  jobId: z.string().uuid(),
  segments: z.array(timedSegmentSchema).min(1, "No segments provided"),
});

export type YoutubeUrlInput = z.infer<typeof youtubeUrlSchema>;
export type TranscribeInput = z.infer<typeof transcribeSchema>;
export type GenerateInput = z.infer<typeof generateSchema>;

const clipSegmentSchema = z.object({
  start: z.number(),
  end: z.number(),
  title: z.string(),
});

export const clipSchema = z.object({
  jobId: z.string().uuid(),
  filePath: z.string(),
  clips: z.array(clipSegmentSchema).min(1),
});

export type ClipInput = z.infer<typeof clipSchema>;
