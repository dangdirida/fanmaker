"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  Home,
  Sparkles,
  User,
  ChevronDown,
  ImageIcon,
  Palette,
  Users,
  Globe,
  Bell,
  LogOut,
  Zap,
  Menu,
  X,
  Crown,
  Sun,
  Moon,
  Gamepad2,
} from "lucide-react";

const studioSubMenus = [
  { label: "버추얼", href: "/studio/virtual", icon: ImageIcon },
  { label: "컨셉", href: "/studio/concept", icon: Palette },
  { label: "퍼포먼스", href: "/studio/performance", icon: Users },
  { label: "아이돌 프로젝트", href: "/studio/idol-project", icon: Sparkles },
  { label: "글로벌 싱크", href: "/studio/global-sync", icon: Globe },
];

const mobileMenus = [
  { label: "팬 유니버스", href: "/feed", icon: Home },
  { label: "창작 스튜디오", href: "/studio/virtual", icon: Sparkles },
  { label: "아이돌 키우기", href: "/studio/idol-game", icon: Gamepad2 },
  { label: "내 프로필", href: "/profile", icon: User },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [studioOpen, setStudioOpen] = useState(
    pathname.startsWith("/studio")
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const pageTitle = (() => {
    if (pathname === "/feed") return "팬 유니버스";
    if (pathname.startsWith("/studio/idol-game")) return "아이돌 키우기";
    if (pathname.startsWith("/studio")) return "창작 스튜디오";
    if (pathname.startsWith("/profile")) return "내 프로필";
    if (pathname.startsWith("/artist")) return "아티스트";
    if (pathname.startsWith("/post")) return "창작물";
    if (pathname === "/pricing") return "Pro 플랜";
    return "";
  })();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors">
      {/* 데스크톱 사이드바 */}
      <aside className="hidden md:flex md:flex-col fixed left-0 top-0 h-screen w-64 bg-gray-50 dark:bg-[#0f0f0f] border-r border-gray-200 dark:border-gray-800 z-50 transition-colors">
        {/* 로고 */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/feed" className="flex items-center gap-2">
            <Zap className="w-7 h-7 text-black fill-[#000000]" />
            <span className="text-xl font-bold">팬메이커</span>
          </Link>
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {/* 팬 유니버스 */}
            <Link
              href="/feed"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === "/feed"
                  ? "bg-black text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>팬 유니버스</span>
            </Link>

            {/* 창작 스튜디오 */}
            <div className="mt-4">
              <button
                onClick={() => setStudioOpen(!studioOpen)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                  pathname.startsWith("/studio")
                    ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  <span>창작 스튜디오</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    studioOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {studioOpen && (
                <div className="mt-1 ml-4 space-y-1">
                  {studioSubMenus.map((sub) => {
                    const SubIcon = sub.icon;
                    const subActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                          subActive
                            ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <SubIcon className="w-4 h-4" />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 아이돌 키우기 */}
            <Link
              href="/studio/idol-game"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname.startsWith("/studio/idol-game")
                  ? "bg-black text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
              <span>아이돌 키우기</span>
            </Link>

            {/* 내 프로필 */}
            <Link
              href={session?.user ? `/profile/${session.user.id}` : "/profile"}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname.startsWith("/profile")
                  ? "bg-black text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <User className="w-5 h-5" />
              <span>내 프로필</span>
            </Link>
          </div>
        </nav>

        {/* Pro 업그레이드 배너 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/pricing"
            className="block p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition-opacity text-white"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 fill-current" />
              <span className="font-semibold text-sm">Pro 업그레이드</span>
            </div>
            <p className="text-xs text-white/80">
              무제한 AI 생성 &amp; 4K 해상도
            </p>
          </Link>
        </div>

        {/* 유저 정보 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt=""
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {session?.user?.nickname || session?.user?.name || "팬메이커"}
              </p>
              <p className="text-xs text-gray-400">
                {session?.user?.isPro ? "Pro" : "Free"}
              </p>
            </div>
            {session?.user && (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <div className="md:ml-64">
        {/* 상단 헤더 */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 transition-colors">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            {/* 모바일: 메뉴 버튼 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-500 dark:text-gray-400"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* 페이지 타이틀 */}
            <h1 className="text-xl md:text-2xl font-bold">{pageTitle}</h1>

            {/* 우측: 테마 토글 + 알림 + 유저 */}
            <div className="flex items-center gap-2">
              {/* 다크모드 토글 */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title={theme === "light" ? "다크모드" : "라이트모드"}
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>

              {session?.user ? (
                <>
                  <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdown(!userDropdown)}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt=""
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="hidden md:inline text-sm">
                        {session.user.nickname || session.user.name || "팬메이커"}
                      </span>
                    </button>
                    {userDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setUserDropdown(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 z-50">
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium truncate">
                              {session.user.nickname || session.user.name || "사용자"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {session.user.email}
                            </p>
                            {session.user.isPro && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-[#374151]/20 text-gray-700 rounded text-[10px] font-medium">
                                Pro
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/profile/${session.user.id}`}
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            내 프로필
                          </Link>
                          {session.user.role === "ADMIN" && (
                            <Link
                              href="/admin"
                              onClick={() => setUserDropdown(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <Crown className="w-4 h-4" />
                              어드민
                            </Link>
                          )}
                          <div className="border-t border-gray-200 dark:border-gray-700 mt-1">
                            <button
                              onClick={() => signOut({ callbackUrl: "/login" })}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              로그아웃
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* 모바일 사이드바 오버레이 */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-64 h-full bg-white dark:bg-[#0f0f0f] border-r border-gray-200 dark:border-gray-800 p-4 space-y-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href="/feed"
                className="flex items-center gap-2 px-3 py-5 mb-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Zap className="w-7 h-7 text-black fill-[#000000]" />
                <span className="text-xl font-bold">팬메이커</span>
              </Link>
              <Link
                href="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Home className="w-5 h-5" />
                팬 유니버스
              </Link>
              {studioSubMenus.map((sub) => {
                const SubIcon = sub.icon;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 ml-4 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <SubIcon className="w-4 h-4" />
                    {sub.label}
                  </Link>
                );
              })}
              <Link
                href="/studio/idol-game"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Gamepad2 className="w-5 h-5" />
                아이돌 키우기
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <User className="w-5 h-5" />
                내 프로필
              </Link>
            </div>
          </div>
        )}

        {/* 페이지 콘텐츠 */}
        <main className="pb-20 md:pb-6">{children}</main>
      </div>

      {/* 모바일 하단 탭바 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0f0f0f] border-t border-gray-200 dark:border-gray-800 z-50 transition-colors">
        <div className="flex items-center justify-around">
          {mobileMenus.map((menu) => {
            const Icon = menu.icon;
            const isActive =
              menu.href === "/feed"
                ? pathname === "/feed"
                : pathname.startsWith(menu.href);
            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex flex-col items-center justify-center py-3 px-6 flex-1 transition-colors ${
                  isActive ? "text-black" : "text-gray-400"
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs">{menu.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
