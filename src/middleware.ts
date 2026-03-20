export { auth as middleware } from "@/auth";

export const config = {
  // Protect everything except public routes, static assets, and API routes
  // that handle their own auth (e.g. Stripe webhook)
  matcher: [
    "/dashboard/:path*",
    "/pricing/:path*",
    "/api/billing/:path*",
    "/api/clip/:path*",
    "/api/clips/:path*",
    "/api/generate/:path*",
    "/api/transcribe/:path*",
    "/api/upload/:path*",
    "/api/youtube/:path*",
  ],
};
