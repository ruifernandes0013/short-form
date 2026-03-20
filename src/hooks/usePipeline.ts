"use client";

import { useState, useCallback } from "react";
import { PipelineState, ClipResult, TimedSegment } from "@/types";

const initialState: PipelineState = {
  step: "idle",
  progress: 0,
  progressLabel: "",
  jobId: null,
  transcript: null,
  clips: null,
  error: null,
};

export function usePipeline() {
  const [state, setState] = useState<PipelineState>(initialState);

  const update = (patch: Partial<PipelineState>) =>
    setState((s) => ({ ...s, ...patch }));

  const reset = () => setState(initialState);

  const runPipeline = useCallback(async (jobId: string, filePath: string) => {
    // Step 1: Transcribe
    update({ step: "transcribing", progress: 10, progressLabel: "Transcribing audio..." });

    const transcribeRes = await fetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, filePath }),
    });

    if (!transcribeRes.ok) {
      const err = await transcribeRes.json();
      throw new Error(err.error || "Transcription failed");
    }

    const { transcript, segments } = await transcribeRes.json() as {
      transcript: string;
      segments: TimedSegment[];
    };
    update({ transcript, progress: 35, progressLabel: "Transcription complete!" });

    // Step 2: Identify clips with Claude
    update({ step: "generating", progress: 40, progressLabel: "Identifying best moments..." });

    const generateRes = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, segments }),
    });

    if (!generateRes.ok) {
      const err = await generateRes.json();
      throw new Error(err.error || "Failed to identify clips");
    }

    const { clips: clipSegments } = await generateRes.json();
    update({ progress: 60, progressLabel: `Found ${clipSegments.length} clips — cutting...` });

    // Step 3: Cut clips with ffmpeg
    update({ step: "clipping", progress: 65, progressLabel: "Cutting clips..." });

    const clipRes = await fetch("/api/clip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, filePath, clips: clipSegments }),
    });

    if (!clipRes.ok) {
      const err = await clipRes.json();
      throw new Error(err.error || "Failed to cut clips");
    }

    const { clips } = await clipRes.json() as { clips: ClipResult[] };

    update({
      step: "done",
      progress: 100,
      progressLabel: "Done!",
      clips,
    });
  }, []);

  const startWithFile = useCallback(
    async (file: File) => {
      setState({ ...initialState, step: "uploading", progress: 0, progressLabel: "Uploading video..." });

      try {
        const { jobId, filePath } = await new Promise<{ jobId: string; filePath: string }>(
          (resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append("video", file);

            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100);
                update({ progress: pct, progressLabel: `Uploading: ${pct}%` });
              }
            };

            xhr.onload = () => {
              if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
              } else {
                try {
                  const err = JSON.parse(xhr.responseText);
                  reject(new Error(err.error || "Upload failed"));
                } catch {
                  reject(new Error("Upload failed"));
                }
              }
            };

            xhr.onerror = () => reject(new Error("Network error during upload"));
            xhr.open("POST", "/api/upload");
            xhr.send(formData);
          }
        );

        await runPipeline(jobId, filePath);
      } catch (error) {
        update({
          step: "error",
          error: error instanceof Error ? error.message : "An error occurred",
        });
      }
    },
    [runPipeline]
  );

  const startWithUrl = useCallback(
    async (url: string) => {
      setState({ ...initialState, step: "downloading", progress: 0, progressLabel: "Starting download..." });

      try {
        const { jobId, filePath } = await new Promise<{ jobId: string; filePath: string }>(
          (resolve, reject) => {
            fetch("/api/youtube", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url }),
            }).then((res) => {
              const reader = res.body!.getReader();
              const decoder = new TextDecoder();

              const read = () => {
                reader.read().then(({ done, value }) => {
                  if (done) { reject(new Error("Stream ended without completion")); return; }

                  const text = decoder.decode(value);
                  const lines = text.split("\n");

                  for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    try {
                      const event = JSON.parse(line.slice(6));
                      if (event.type === "progress") {
                        update({ progress: event.progress, progressLabel: event.label });
                      } else if (event.type === "done") {
                        resolve({ jobId: event.jobId, filePath: event.filePath });
                      } else if (event.type === "error") {
                        reject(new Error(event.error));
                      }
                    } catch {
                      // ignore
                    }
                  }

                  read();
                });
              };

              read();
            }).catch(reject);
          }
        );

        await runPipeline(jobId, filePath);
      } catch (error) {
        update({
          step: "error",
          error: error instanceof Error ? error.message : "An error occurred",
        });
      }
    },
    [runPipeline]
  );

  return { state, startWithFile, startWithUrl, reset };
}
