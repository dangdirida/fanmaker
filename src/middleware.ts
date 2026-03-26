import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  // 미로그인 → 로그인 페이지
  const protectedPaths = ["/studio", "/profile", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (isProtected && !session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // /admin → ADMIN role 필수
  if (pathname.startsWith("/admin")) {
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/feed", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/profile/:path*", "/admin/:path*"],
};
