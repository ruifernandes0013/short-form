import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createJobDir } from "@/lib/tmp";
import { downloadYouTube } from "@/lib/ytdlp";
import { youtubeUrlSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const sendEvent = (data: object) =>
    encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await request.json();
        const { url } = youtubeUrlSchema.parse(body);

        const jobId = uuidv4();
        const outputDir = await createJobDir(jobId);

        controller.enqueue(sendEvent({ type: "start", jobId }));

        const filePath = await downloadYouTube(url, outputDir, (pct, label) => {
          controller.enqueue(sendEvent({ type: "progress", progress: pct, label }));
        });

        controller.enqueue(
          sendEvent({ type: "done", jobId, filePath, filename: url })
        );
      } catch (error) {
        controller.enqueue(
          sendEvent({
            type: "error",
            error: error instanceof Error ? error.message : "Download failed",
          })
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
