export type PipelineStep =
  | "idle"
  | "uploading"
  | "downloading"
  | "transcribing"
  | "generating"
  | "clipping"
  | "done"
  | "error";

export interface UploadResult {
  jobId: string;
  filePath: string;
  filename: string;
}

export interface TimedSegment {
  start: number;
  end: number;
  text: string;
}

export interface ClipSegment {
  start: number;
  end: number;
  title: string;
}

export interface ClipResult {
  index: number;
  title: string;
  start: number;
  end: number;
  filename: string;
  url: string;
  duration: number;
}

export interface PipelineState {
  step: PipelineStep;
  progress: number;
  progressLabel: string;
  jobId: string | null;
  transcript: string | null;
  clips: ClipResult[] | null;
  error: string | null;
}

export interface HealthStatus {
  ffmpeg: boolean;
  ytdlp: boolean;
}
