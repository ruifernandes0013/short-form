import { NextRequest, NextResponse } from "next/server";
import { getTmpPath } from "@/lib/tmp";
import fs from "fs";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string; filename: string }> }
) {
  const { jobId, filename } = await params;

  // Basic path sanitization
  if (!/^[a-f0-9-]+$/.test(jobId) || !/^clip-\d+\.mp4$/.test(filename)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const filePath = getTmpPath(jobId, filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Clip not found" }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileStream = fs.createReadStream(filePath);

  return new Response(fileStream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(stat.size),
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
