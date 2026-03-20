import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import { createJobDir, getTmpPath } from "@/lib/tmp";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("video") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ error: "File must be a video" }, { status: 400 });
    }

    const maxBytes = parseInt(process.env.MAX_UPLOAD_BYTES || "524288000");
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large. Max size is ${(maxBytes / 1024 / 1024).toFixed(0)}MB` },
        { status: 400 }
      );
    }

    const jobId = uuidv4();
    await createJobDir(jobId);

    const ext = path.extname(file.name) || ".mp4";
    const filePath = getTmpPath(jobId, `original${ext}`);

    const bytes = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(bytes));

    return NextResponse.json({ jobId, filePath, filename: file.name });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
