"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Pin } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/notices")
      .then(r => r.json())
      .then(d => { if (d.success) setNotices(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    if (data.success) {
      setNotices(prev => [data.data, ...prev]);
      setTitle(""); setContent(""); setShowForm(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("삭제할까요?")) return;
    await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">공지사항 관리</h1>
          <p className="text-sm text-gray-500 mt-1">총 {notices.length}개의 공지</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-xl hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" /> 새 공지 작성
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">새 공지 작성</h2>
          <input type="text" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-gray-200" />
          <textarea placeholder="내용" value={content} onChange={e => setContent(e.target.value)} rows={4}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-xl">취소</button>
            <button onClick={handleCreate} disabled={saving}
              className="px-4 py-2 text-sm bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50">
              {saving ? "저장 중..." : "게시"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-24 animate-pulse" />
        )) : notices.map(notice => (
          <div key={notice.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {notice.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500" />}
                  <h3 className="text-sm font-semibold text-gray-900">{notice.title}</h3>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{notice.content}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(notice.createdAt).toLocaleDateString("ko-KR")}</p>
              </div>
              <button onClick={() => handleDelete(notice.id)}
                className="ml-4 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {!loading && notices.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center text-sm text-gray-400">
            공지사항이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
