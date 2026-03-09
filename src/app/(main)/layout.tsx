"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  Sparkles,
  User,
  ChevronDown,
  ChevronUp,
  Music,
  ImageIcon,
  Palette,
  Activity,
  Users,
  Globe,
  Bell,
  LogOut,
  Crown,
  Menu,
  X,
} from "lucide-react";

const studioSubMenus = [
  { label: "리믹스", href: "/studio/remix", icon: Music },
  { label: "버추얼", href: "/studio/virtual", icon: ImageIcon },
  { label: "컨셉", href: "/studio/concept", icon: Palette },
  { label: "퍼포먼스", href: "/studio/performance", icon: Activity },
  { label: "아이돌 프로젝트", href: "/studio/idol-project", icon: Users },
  { label: "글로벌 싱크", href: "/studio/global-sync", icon: Globe },
];

const mainMenus = [
  { label: "팬 유니버스", href: "/feed", icon: Home },
  { label: "창작 스튜디오", href: "/studio", icon: Sparkles, hasSubmenu: true },
  { label: "내 프로필", href: "/profile", icon: User },
];

const mobileMenus = [
  { label: "홈", href: "/feed", icon: Home },
  { label: "스튜디오", href: "/studio", icon: Sparkles },
  { label: "프로필", href: "/profile", icon: User },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [studioOpen, setStudioOpen] = useState(
    pathname.startsWith("/studio")
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* 데스크톱 사이드바 */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-[#111] border-r border-gray-800 flex-col z-40">
        {/* 로고 */}
        <Link
          href="/feed"
          className="px-6 py-5 border-b border-gray-800"
        >
          <span className="text-xl font-bold bg-gradient-to-r from-[#ff3d7f] to-[#c084fc] bg-clip-text text-transparent">
            FanMaker
          </span>
        </Link>

        {/* 메뉴 */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {mainMenus.map((menu) => {
            const Icon = menu.icon;
            const isActive =
              pathname === menu.href || pathname.startsWith(menu.href + "/");

            if (menu.hasSubmenu) {
              return (
                <div key={menu.href}>
                  <button
                    onClick={() => setStudioOpen(!studioOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      pathname.startsWith("/studio")
                        ? "bg-[#ff3d7f]/10 text-[#ff3d7f]"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      {menu.label}
                    </div>
                    {studioOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {studioOpen && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {studioSubMenus.map((sub) => {
                        const SubIcon = sub.icon;
                        const subActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              subActive
                                ? "text-[#ff3d7f] bg-[#ff3d7f]/5"
                                : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/30"
                            }`}
                          >
                            <SubIcon className="w-3.5 h-3.5" />
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-[#ff3d7f]/10 text-[#ff3d7f]"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {menu.label}
              </Link>
            );
          })}
        </nav>

        {/* 하단: Pro 배너 + 유저 정보 */}
        <div className="px-3 pb-4 space-y-3">
          {session?.user && !session.user.isPro && (
            <Link
              href="/pricing"
              className="block px-3 py-3 bg-gradient-to-r from-[#ff3d7f]/20 to-[#c084fc]/20 rounded-lg border border-[#ff3d7f]/30 hover:border-[#ff3d7f]/50 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4 text-[#ff3d7f]" />
                <span className="text-white font-medium">Pro 업그레이드</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                무제한 AI 생성, 4K 해상도
              </p>
            </Link>
          )}

          {session?.user && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">
                  {session.user.nickname || session.user.name || "사용자"}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-gray-500 hover:text-gray-300 transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <div className="md:ml-64">
        {/* 상단 헤더 */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-800">
          <div className="flex items-center justify-between px-4 md:px-6 h-14">
            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-400"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* 페이지 타이틀 */}
            <h1 className="text-sm font-medium text-white md:text-base">
              {pathname === "/feed" && "팬 유니버스"}
              {pathname.startsWith("/studio") && "창작 스튜디오"}
              {pathname === "/profile" && "내 프로필"}
              {pathname.startsWith("/artist") && "아티스트"}
              {pathname.startsWith("/post") && "창작물"}
              {pathname === "/pricing" && "Pro 플랜"}
            </h1>

            {/* 우측: 로그인 상태에 따라 분기 */}
            <div className="flex items-center gap-3">
              {session?.user ? (
                <>
                  <button className="text-gray-400 hover:text-white transition-colors relative">
                    <Bell className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdown(!userDropdown)}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-gray-400 mx-auto mt-2" />
                        )}
                      </div>
                      <span className="hidden sm:block text-sm text-gray-300 max-w-[100px] truncate">
                        {session.user.nickname || session.user.name || "사용자"}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
                    </button>
                    {userDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setUserDropdown(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-xl py-1 z-50">
                          {/* 유저 정보 */}
                          <div className="px-4 py-3 border-b border-gray-700">
                            <p className="text-sm text-white font-medium truncate">
                              {session.user.nickname || session.user.name || "사용자"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {session.user.email}
                            </p>
                            {session.user.isPro && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-[#c084fc]/20 text-[#c084fc] rounded text-[10px] font-medium">
                                Pro
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/profile/${session.user.id}`}
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            내 프로필
                          </Link>
                          {session.user.role === "ADMIN" && (
                            <Link
                              href="/admin"
                              onClick={() => setUserDropdown(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                            >
                              <Crown className="w-4 h-4" />
                              어드민
                            </Link>
                          )}
                          <div className="border-t border-gray-700 mt-1">
                            <button
                              onClick={() => signOut({ callbackUrl: "/login" })}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 transition-colors"
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
                  className="px-4 py-2 bg-[#ff3d7f] text-white text-sm font-medium rounded-lg hover:bg-[#e6356f] transition-colors"
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
              className="w-64 h-full bg-[#111] border-r border-gray-800 p-4 space-y-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href="/feed"
                className="block px-3 py-5 mb-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl font-bold bg-gradient-to-r from-[#ff3d7f] to-[#c084fc] bg-clip-text text-transparent">
                  FanMaker
                </span>
              </Link>
              {mainMenus.map((menu) => {
                const Icon = menu.icon;
                return (
                  <Link
                    key={menu.href}
                    href={menu.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800/50"
                  >
                    <Icon className="w-4 h-4" />
                    {menu.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 페이지 콘텐츠 */}
        <main className="pb-20 md:pb-0">{children}</main>
      </div>

      {/* 모바일 하단 탭바 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111] border-t border-gray-800 z-30">
        <div className="flex items-center justify-around h-16">
          {mobileMenus.map((menu) => {
            const Icon = menu.icon;
            const isActive =
              pathname === menu.href || pathname.startsWith(menu.href + "/");
            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                  isActive ? "text-[#ff3d7f]" : "text-gray-500"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{menu.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
