import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // 로그인 필요한 경로들
  const protectedPaths = [
    "/studio",
    "/profile/",   // /profile/[userId] 는 보호
    "/settings",
    "/admin",
  ];

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // /profile 정확히 일치할 때: 토큰 없으면 로그인으로, 있으면 통과 (페이지에서 리다이렉트)
  if (pathname === "/profile") {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 로그인 안 된 상태에서 보호 경로 접근 시 로그인 페이지로
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 이미 로그인된 상태에서 로그인 페이지 접근 시 피드로
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|public).*)",
  ],
};
