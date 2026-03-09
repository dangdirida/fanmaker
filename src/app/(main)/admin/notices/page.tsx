"use client";

import { useEffect, useState } from "react";

interface Notice {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", content: "", isPinned: true });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notices");
      const json = await res.json();
      if (json.success) {
        setNotices(json.data);
      }
    } catch {
      // 에러 무시
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setForm({ title: "", content: "", isPinned: true });
        setShowForm(false);
        fetchNotices();
      } else {
        alert(json.error || "공지사항 작성에 실패했습니다");
      }
    } catch {
      alert("공지사항 작성에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noticeId: string) => {
    if (!confirm("정말 이 공지사항을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/admin/notices/${noticeId}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.success) {
      setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    } else {
      alert(json.error || "삭제에 실패했습니다");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">공지사항 관리</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2 bg-[#ff3d7f] text-white rounded-lg font-medium hover:bg-[#ff3d7f]/80 transition-colors"
        >
          {showForm ? "닫기" : "+ 공지 작성"}
        </button>
      </div>

      {/* 작성 폼 */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#141414] border border-[#222] rounded-xl p-6 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm text-gray-400 mb-1">제목 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="공지사항 제목"
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff3d7f]"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">내용 *</label>
            <textarea
              value={form.content}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="공지사항 내용을 입력하세요..."
              rows={5}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff3d7f] resize-none"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPinned"
              checked={form.isPinned}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isPinned: e.target.checked }))
              }
              className="w-4 h-4 accent-[#ff3d7f]"
            />
            <label htmlFor="isPinned" className="text-sm text-gray-300">
              공개 (고정)
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-[#c084fc] text-white rounded-lg font-medium hover:bg-[#c084fc]/80 disabled:opacity-50 transition-colors"
          >
            {submitting ? "작성 중..." : "공지 등록"}
          </button>
        </form>
      )}

      {/* 공지 목록 */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-gray-500">로딩 중...</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            등록된 공지사항이 없습니다
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-[#141414] border border-[#222] rounded-xl p-5 hover:border-[#333] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium truncate">
                      {notice.title}
                    </h3>
                    {notice.isPublic && (
                      <span className="px-2 py-0.5 bg-[#ff3d7f]/15 text-[#ff3d7f] rounded text-xs shrink-0">
                        공개
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                    {notice.content}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(notice.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(notice.id)}
                  className="px-3 py-1 bg-red-500/15 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors shrink-0"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
