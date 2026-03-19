"use client";

import { useEffect, useState } from "react";

interface Artist {
  id: string;
  name: string;
  nameEn: string | null;
  agency: string | null;
  debutDate: string | null;
  members: unknown;
  groupImageUrl: string | null;
  _count?: { artistFollows: number };
}

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    nameEn: "",
    debutYear: "",
    memberCount: "",
    company: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/artists");
      const json = await res.json();
      if (json.success) {
        setArtists(json.data);
      }
    } catch {
      // 에러 무시
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          nameEn: form.nameEn || null,
          debutDate: form.debutYear
            ? new Date(`${form.debutYear}-01-01`).toISOString()
            : null,
          members: form.memberCount
            ? { count: parseInt(form.memberCount) }
            : null,
          agency: form.company || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setForm({ name: "", nameEn: "", debutYear: "", memberCount: "", company: "" });
        fetchArtists();
      } else {
        alert(json.error || "아티스트 추가에 실패했습니다");
      }
    } catch {
      alert("아티스트 추가에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const getDebutYear = (debutDate: string | null) => {
    if (!debutDate) return "-";
    return new Date(debutDate).getFullYear().toString();
  };

  const getMemberCount = (members: unknown) => {
    if (!members || typeof members !== "object") return "-";
    const m = members as Record<string, unknown>;
    if ("count" in m && typeof m.count === "number") return m.count;
    if (Array.isArray(members)) return members.length;
    return "-";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">아티스트 관리</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 bg-black text-white rounded-lg font-medium hover:bg-black/80 transition-colors"
        >
          + 아티스트 추가
        </button>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-xl border border-[#222]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#141414] text-gray-400 text-left">
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">영문명</th>
              <th className="px-4 py-3">데뷔년도</th>
              <th className="px-4 py-3">멤버 수</th>
              <th className="px-4 py-3">소속사</th>
              <th className="px-4 py-3">팔로워</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  로딩 중...
                </td>
              </tr>
            ) : artists.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  등록된 아티스트가 없습니다
                </td>
              </tr>
            ) : (
              artists.map((artist) => (
                <tr
                  key={artist.id}
                  className="border-t border-[#222] hover:bg-[#1a1a2e] transition-colors"
                >
                  <td className="px-4 py-3 text-white font-medium">
                    {artist.name}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {artist.nameEn || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {getDebutYear(artist.debutDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {getMemberCount(artist.members)}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {artist.agency || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {artist._count?.artistFollows?.toLocaleString() ?? "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#141414] border border-[#333] rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">
              아티스트 추가
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  이름 *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  영문명
                </label>
                <input
                  type="text"
                  value={form.nameEn}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nameEn: e.target.value }))
                  }
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    데뷔년도
                  </label>
                  <input
                    type="number"
                    value={form.debutYear}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        debutYear: e.target.value,
                      }))
                    }
                    placeholder="2020"
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    멤버 수
                  </label>
                  <input
                    type="number"
                    value={form.memberCount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        memberCount: e.target.value,
                      }))
                    }
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  소속사
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, company: e.target.value }))
                  }
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-black"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-[#222] text-gray-300 rounded-lg hover:bg-[#333] transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-black/80 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "추가 중..." : "추가"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
