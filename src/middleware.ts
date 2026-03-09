import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// 인증 필요 경로
const protectedPaths = [
  "/studio",
  "/profile",
  "/admin",
  "/onboarding",
];

const protectedApiPaths = [
  "/api/ai/",
  "/api/users/onboarding",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtectedPage = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isProtectedApi = protectedApiPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isPostApi = req.method === "POST" && pathname === "/api/posts";

  const needsAuth = isProtectedPage || isProtectedApi || isPostApi;

  if (needsAuth && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 온보딩 미완료 사용자 리다이렉트
  if (
    req.auth &&
    !req.auth.user.onboardingDone &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/signup")
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // 온보딩 완료 사용자가 /onboarding 접근 시
  if (req.auth?.user.onboardingDone && pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // 어드민 권한 체크
  if (pathname.startsWith("/admin") && req.auth?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|og-thumbnail.png|apple-touch-icon.png|favicon.png|api/auth).*)",
  ],
};
