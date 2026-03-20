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
    "/profile",
    "/settings",
    "/admin",
  ];

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

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
