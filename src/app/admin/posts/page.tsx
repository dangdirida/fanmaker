"use client";
import { useEffect, useState } from "react";
import { Search, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  category: string;
  viewCount: number;
  createdAt: string;
  author: { nickname: string | null; email: string | null };
  _count: { reactions: number; comments: number };
}

const CATEGORY_LABELS: Record<string, string> = {
  REMIX: "리믹스", VIRTUAL: "버추얼", CONCEPT: "컨셉",
  PERFORMANCE: "퍼포먼스", IDOL_PROJECT: "아이돌 프로젝트", GLOBAL_SYNC: "글로벌 싱크",
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/posts")
      .then(r => r.json())
      .then(d => { if (d.success) setPosts(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author.nickname?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (postId: string) => {
    if (!confirm("이 게시물을 삭제할까요?")) return;
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">게시물 관리</h1>
        <p className="text-sm text-gray-500 mt-1">총 {posts.length}개의 게시물</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="제목 또는 작성자 검색..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">제목</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">카테고리</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">작성자</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">조회</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">반응</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">날짜</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
              ))}</tr>
            )) : filtered.map(post => (
              <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-gray-900 max-w-[200px] truncate">{post.title}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                    {CATEGORY_LABELS[post.category] || post.category}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{post.author.nickname || post.author.email}</td>
                <td className="px-5 py-4 text-sm text-gray-900">{post.viewCount.toLocaleString()}</td>
                <td className="px-5 py-4 text-sm text-gray-900">{post._count.reactions}</td>
                <td className="px-5 py-4 text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString("ko-KR")}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <Link href={`/post/${post.id}`} target="_blank"
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <button onClick={() => handleDelete(post.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">게시물이 없습니다</div>
        )}
      </div>
    </div>
  );
}
