"use client";

import { useEffect, useState, useCallback } from "react";

interface Post {
  id: string;
  title: string;
  category: string;
  viewCount: number;
  createdAt: string;
  author: {
    id: string;
    nickname: string | null;
    image: string | null;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CATEGORIES = [
  { value: "", label: "전체" },
  { value: "REMIX", label: "리믹스" },
  { value: "VIRTUAL", label: "버추얼" },
  { value: "CONCEPT", label: "컨셉" },
  { value: "PERFORMANCE", label: "퍼포먼스" },
  { value: "IDOL_PROJECT", label: "아이돌 프로젝트" },
  { value: "GLOBAL_SYNC", label: "글로벌 싱크" },
];

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(
    async (page: number, searchQuery: string, cat: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          search: searchQuery,
          category: cat,
          limit: "20",
        });
        const res = await fetch(`/api/posts?${params}`);
        const json = await res.json();
        if (json.success) {
          setPosts(json.data);
          setPagination(json.pagination);
        }
      } catch {
        // 에러 무시
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPosts(pagination.page, search, category);
  }, [pagination.page, search, category, fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSearch(searchInput);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("정말 이 게시물을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } else {
      alert(json.error || "삭제에 실패했습니다");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-10">
      <h1 className="text-3xl font-bold text-white mb-6">게시물 관리</h1>

      {/* 검색 + 필터 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="제목 검색..."
            className="flex-1 max-w-md bg-[#141414] border border-[#333] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff3d7f]"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-[#ff3d7f] text-white rounded-lg font-medium hover:bg-[#ff3d7f]/80 transition-colors"
          >
            검색
          </button>
        </form>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className="bg-[#141414] border border-[#333] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#c084fc]"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-xl border border-[#222]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#141414] text-gray-400 text-left">
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">작성자</th>
              <th className="px-4 py-3">카테고리</th>
              <th className="px-4 py-3">조회수</th>
              <th className="px-4 py-3">작성일</th>
              <th className="px-4 py-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  로딩 중...
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  게시물이 없습니다
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-t border-[#222] hover:bg-[#1a1a2e] transition-colors"
                >
                  <td className="px-4 py-3 text-white font-medium max-w-[300px] truncate">
                    {post.title}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {post.author?.nickname || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-[#c084fc]/15 text-[#c084fc] rounded text-xs">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {post.viewCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-3 py-1 bg-red-500/15 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            disabled={pagination.page <= 1}
            className="px-3 py-1.5 bg-[#222] text-white rounded disabled:opacity-30 hover:bg-[#333] transition-colors text-sm"
          >
            이전
          </button>
          <span className="text-gray-400 text-sm">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1.5 bg-[#222] text-white rounded disabled:opacity-30 hover:bg-[#333] transition-colors text-sm"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
