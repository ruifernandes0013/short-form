import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic auth check: redirect to home if no session cookie present.
// NextAuth v5 (Auth.js) uses "authjs.session-token" (dev) or
// "__Secure-authjs.session-token" (prod/HTTPS).
// Full session verification happens in each server component / API route via auth().
export function proxy(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pricing/:path*",
    "/account/:path*",
    "/api/billing/:path*",
    "/api/clip/:path*",
    "/api/clips/:path*",
    "/api/generate/:path*",
    "/api/transcribe/:path*",
    "/api/upload/:path*",
    "/api/youtube/:path*",
  ],
};
