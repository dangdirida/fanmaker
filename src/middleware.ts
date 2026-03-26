import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 로그인 필요 경로
  const protectedPaths = ["/studio", "/profile", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // 미로그인 → 로그인 페이지
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // /admin → ADMIN role 필수
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/feed", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/profile/:path*", "/admin/:path*"],
};
