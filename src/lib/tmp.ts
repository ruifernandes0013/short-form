import path from "path";
import fs from "fs/promises";

const TMP_BASE = process.env.TMP_DIR || "/tmp";

export function getJobDir(jobId: string): string {
  return path.join(TMP_BASE, `sf-${jobId}`);
}

export function getTmpPath(jobId: string, filename: string): string {
  return path.join(getJobDir(jobId), filename);
}

export async function createJobDir(jobId: string): Promise<string> {
  const dir = getJobDir(jobId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function cleanupJob(jobId: string): Promise<void> {
  try {
    const dir = getJobDir(jobId);
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }
}
