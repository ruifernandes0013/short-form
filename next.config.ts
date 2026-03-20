import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Turbopack from bundling packages that rely on native binaries or
  // dynamic require — they must be loaded from the real filesystem at runtime.
  serverExternalPackages: [
    "@prisma/client",
    "fluent-ffmpeg",
    "formidable",
    "ffmpeg-static",
    "@ffprobe-installer/ffprobe",
    "youtubei.js",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
};

export default nextConfig;
