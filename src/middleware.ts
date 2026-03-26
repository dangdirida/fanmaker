import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 세션 쿠키 확인 (next-auth v5)
  const sessionCookie =
    req.cookies.get("authjs.session-token") ||
    req.cookies.get("__Secure-authjs.session-token") ||
    req.cookies.get("next-auth.session-token") ||
    req.cookies.get("__Secure-next-auth.session-token");

  const isLoggedIn = !!sessionCookie;

  // 로그인 필요 경로
  const protectedPaths = ["/studio", "/profile", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // /admin → role 체크는 페이지 컴포넌트에서 처리
  // (Edge Runtime에서 JWT 디코딩 불가 → 서버 컴포넌트에서 처리)

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/profile/:path*", "/admin/:path*"],
};
