"use client";
import { useEffect, useState } from "react";
import { Search, UserCheck, UserX, Shield, Trash2 } from "lucide-react";

interface User {
  id: string;
  nickname: string | null;
  email: string | null;
  name: string | null;
  role: string;
  isPro: boolean;
  isSuspended: boolean;
  createdAt: string;
  activityType: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(d => { if (d.success) setUsers(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.nickname?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`${name} 유저를 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    } else {
      alert(data.error || "삭제 실패");
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">유저 관리</h1>
        <p className="text-sm text-gray-500 mt-1">총 {users.length}명의 유저</p>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="이름 또는 이메일 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">유저</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">이메일</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">플랜</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">역할</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">가입일</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                      {(user.nickname || user.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.nickname || "-"}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-xs ${user.isPro ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}>{user.isPro ? "Pro" : "Free"}</span></td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    user.role === "ADMIN" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {user.role === "ADMIN" && <Shield className="w-3 h-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    {user.role !== "ADMIN" ? (
                      <button onClick={() => handleRoleChange(user.id, "ADMIN")}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                        <UserCheck className="w-3 h-3" /> 어드민
                      </button>
                    ) : (
                      <button onClick={() => handleRoleChange(user.id, "USER")}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                        <UserX className="w-3 h-3" /> 일반
                      </button>
                    )}
                    <button onClick={() => handleDelete(user.id, user.nickname || user.email || "?")}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">검색 결과가 없습니다</div>
        )}
      </div>
    </div>
  );
}
