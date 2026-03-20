import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic auth check: if the session cookie is absent, redirect to home (login page).
// Full session verification happens in each server component / API route via auth().
export function proxy(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  if (!sessionCookie) {
    const home = new URL("/", request.url);
    return NextResponse.redirect(home);
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
