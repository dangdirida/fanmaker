import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, FileText, Music, Bell, LogOut, Zap } from "lucide-react";

const navItems = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/users", label: "유저 관리", icon: Users },
  { href: "/admin/posts", label: "게시물 관리", icon: FileText },
  { href: "/admin/artists", label: "아티스트 관리", icon: Music },
  { href: "/admin/notices", label: "공지사항", icon: Bell },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "ADMIN") redirect("/feed");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 사이드바 */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* 로고 */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-100">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">FanMaker</p>
            <p className="text-[10px] text-gray-400">관리자 콘솔</p>
          </div>
        </div>
        {/* 네비 */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        {/* 하단 */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              {(session.user.name || "A").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{session.user.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{session.user.email}</p>
            </div>
          </div>
          <Link href="/feed"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            사이트로 돌아가기
          </Link>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
