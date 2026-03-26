"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, FileText, Music, Bell, TrendingUp, Star, ArrowUpRight, Activity } from "lucide-react";

interface Stats {
  totalUsers: number;
  todayUsers: number;
  totalPosts: number;
  todayPosts: number;
  proUsers: number;
  totalAIJobs: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "총 유저", value: stats?.totalUsers, sub: `오늘 +${stats?.todayUsers ?? 0}명 가입`, icon: Users, color: "bg-blue-50 text-blue-600", trend: "up" },
    { label: "총 게시물", value: stats?.totalPosts, sub: `오늘 +${stats?.todayPosts ?? 0}개 게시`, icon: FileText, color: "bg-purple-50 text-purple-600", trend: "up" },
    { label: "Pro 유저", value: stats?.proUsers, sub: "유료 구독자", icon: Star, color: "bg-amber-50 text-amber-600", trend: "neutral" },
    { label: "AI 작업 수", value: stats?.totalAIJobs, sub: "총 AI 생성 작업", icon: Activity, color: "bg-green-50 text-green-600", trend: "up" },
  ];

  const quickLinks = [
    { href: "/admin/users", label: "유저 관리", desc: "가입자 목록, 역할 관리", icon: Users, count: stats?.totalUsers },
    { href: "/admin/posts", label: "게시물 관리", desc: "게시물 검토 및 삭제", icon: FileText, count: stats?.totalPosts },
    { href: "/admin/artists", label: "아티스트 관리", desc: "아티스트 등록 및 수정", icon: Music, count: null },
    { href: "/admin/notices", label: "공지사항", desc: "공지 작성 및 관리", icon: Bell, count: null },
  ];

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">FanMaker 플랫폼 현황을 한눈에 확인하세요</p>
        </div>
        <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
          {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-4.5 h-4.5" />
              </div>
              {card.trend === "up" && (
                <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
                  <TrendingUp className="w-3 h-3" /> 증가
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {loading ? <span className="inline-block w-12 h-7 bg-gray-100 rounded animate-pulse" /> : (card.value?.toLocaleString() ?? "-")}
            </div>
            <div className="text-xs text-gray-400">{card.label}</div>
            <div className="text-xs text-gray-500 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* 관리 메뉴 */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">관리 메뉴</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                    <link.icon className="w-4.5 h-4.5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{link.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{link.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {link.count != null && (
                    <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                      {loading ? "-" : link.count?.toLocaleString()}
                    </span>
                  )}
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 최근 활동 placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">플랫폼 현황</h2>
          <span className="text-xs text-gray-400">실시간</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "총 게시물", value: stats?.totalPosts, icon: FileText, color: "text-purple-500" },
            { label: "오늘 가입", value: stats?.todayUsers, icon: Users, color: "text-blue-500" },
            { label: "AI 작업", value: stats?.totalAIJobs, icon: Activity, color: "text-green-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <div>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-bold text-gray-900">
                  {loading ? "-" : (item.value?.toLocaleString() ?? "0")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
