"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  todayUsers: number;
  totalPosts: number;
  todayPosts: number;
  proUsers: number;
  totalAIJobs: number;
}

const statCards = [
  { key: "totalUsers", label: "총 유저", icon: "" },
  { key: "todayUsers", label: "오늘 가입", icon: "🆕" },
  { key: "totalPosts", label: "총 게시물", icon: "" },
  { key: "todayPosts", label: "오늘 게시물", icon: "" },
  { key: "proUsers", label: "Pro 유저", icon: "" },
  { key: "totalAIJobs", label: "AI 작업 수", icon: "" },
] as const;

const quickLinks = [
  { href: "/admin/users", label: "유저 관리", icon: "" },
  { href: "/admin/posts", label: "게시물 관리", icon: "" },
  { href: "/admin/artists", label: "아티스트 관리", icon: "" },
  { href: "/admin/notices", label: "공지사항", icon: "" },
];

function useAdminGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user as {role?: string}).role !== "ADMIN") {
      router.replace("/feed");
    }
  }, [session, status, router]);
  return session;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setStats(json.data);
        } else {
          setError(json.error || "통계를 불러올 수 없습니다");
        }
      })
      .catch(() => setError("통계를 불러올 수 없습니다"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-10">
      <h1 className="text-3xl font-bold text-white mb-2">어드민 대시보드</h1>
      <p className="text-gray-400 mb-8">FanMaker 관리자 페이지</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="bg-[#141414] border border-[#222] rounded-xl p-5 flex flex-col items-center gap-2 hover:border-black/40 transition-colors"
          >
            <span className="text-2xl">{card.icon}</span>
            <span className="text-xs text-gray-400">{card.label}</span>
            <span className="text-2xl font-bold text-white">
              {loading ? (
                <span className="inline-block w-8 h-6 bg-[#222] rounded animate-pulse" />
              ) : (
                stats?.[card.key]?.toLocaleString() ?? "-"
              )}
            </span>
          </div>
        ))}
      </div>

      {/* 빠른 링크 */}
      <h2 className="text-xl font-semibold text-white mb-4">빠른 이동</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-[#141414] border border-[#222] rounded-xl p-6 flex flex-col items-center gap-3 hover:border-gray-700/50 hover:bg-[#1a1a2e] transition-all group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">
              {link.icon}
            </span>
            <span className="text-sm font-medium text-gray-300 group-hover:text-gray-700 transition-colors">
              {link.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
