"use client";

import { useEffect, useState, useCallback } from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
  nickname: string | null;
  image: string | null;
  activityType: string;
  role: string;
  isPro: boolean;
  isSuspended: boolean;
  createdAt: string;
  authMethod: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async (page: number, searchQuery: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users?page=${page}&search=${encodeURIComponent(searchQuery)}`
      );
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
        setPagination(json.pagination);
      }
    } catch {
      // 에러 무시
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(pagination.page, search);
  }, [pagination.page, search, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSearch(searchInput);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const json = await res.json();
    if (json.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } else {
      alert(json.error || "역할 변경에 실패했습니다");
    }
  };

  const handleRowClick = (user: User) => {
    alert(
      `유저 상세\n\nID: ${user.id}\n닉네임: ${user.nickname || "-"}\n이메일: ${user.email}\n역할: ${user.role}\nPro: ${user.isPro ? "Yes" : "No"}\n로그인 방식: ${user.authMethod}\n가입일: ${new Date(user.createdAt).toLocaleDateString("ko-KR")}`
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-10">
      <h1 className="text-3xl font-bold text-white mb-6">유저 관리</h1>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="닉네임 또는 이메일 검색..."
          className="flex-1 max-w-md bg-[#141414] border border-[#333] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff3d7f]"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-[#ff3d7f] text-white rounded-lg font-medium hover:bg-[#ff3d7f]/80 transition-colors"
        >
          검색
        </button>
      </form>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-xl border border-[#222]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#141414] text-gray-400 text-left">
              <th className="px-4 py-3">아바타</th>
              <th className="px-4 py-3">닉네임</th>
              <th className="px-4 py-3">이메일</th>
              <th className="px-4 py-3">역할</th>
              <th className="px-4 py-3">Pro</th>
              <th className="px-4 py-3">로그인 방식</th>
              <th className="px-4 py-3">가입일</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  로딩 중...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  유저가 없습니다
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => handleRowClick(user)}
                  className="border-t border-[#222] hover:bg-[#1a1a2e] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-gray-500 text-xs">
                        ?
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    {user.nickname || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleRoleChange(user.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#222] border border-[#333] text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-[#c084fc]"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {user.isPro ? (
                      <span className="px-2 py-0.5 bg-[#c084fc]/20 text-[#c084fc] rounded text-xs font-medium">
                        Pro
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">Free</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-0.5 rounded ${
                      user.authMethod.includes("google")
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-green-500/20 text-green-400"
                    }`}>
                      {user.authMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(user.createdAt).toLocaleDateString("ko-KR")}
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
