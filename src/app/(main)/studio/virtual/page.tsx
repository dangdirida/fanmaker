"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ExternalLink, Loader2, Mic, Star } from "lucide-react";

type VirtualIdol = {
  id: string;
  name: string;
  concept: string | null;
  gender: string;
  stylePreset: string;
  hairColor: string;
  hairLength: string;
  skinTone: string;
  eyeColor: string;
  outfitStyle: string;
  accessories: string[];
  isDraft: boolean;
  postId: string | null;
  step: number;
  updatedAt: string;
};


export default function VirtualStudioListPage() {
  const [idols, setIdols] = useState<VirtualIdol[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");

  useEffect(() => {
    fetch("/api/virtual-idols")
      .then((r) => r.json())
      .then((d) => { if (d.success) setIdols(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    const res = await fetch(`/api/virtual-idols/${id}`, { method: "DELETE" });
    if (res.ok) setIdols((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = idols.filter((i) => {
    if (filter === "draft") return i.isDraft;
    if (filter === "published") return !i.isDraft;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          버추얼 아이돌 스튜디오
        </h1>
        <Link
          href="/studio/virtual/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새로 만들기
        </Link>
      </div>
      <p className="text-gray-500 text-sm mb-8">
        나만의 K-pop 버추얼 아이돌 캐릭터를 만들어보세요
      </p>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-6">
        {([
          { key: "all" as const, label: "전체" },
          { key: "draft" as const, label: "임시저장" },
          { key: "published" as const, label: "게시됨" },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === t.key ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <Star className="w-8 h-8 text-gray-300" />
          </div>
          <Mic className="w-6 h-6 text-gray-300 -mt-2" />
          <p className="text-gray-500 font-medium">아직 만든 아이돌이 없어요</p>
          <Link
            href="/studio/virtual/new"
            className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            첫 버추얼 아이돌 만들기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((idol) => {
            return (
              <div key={idol.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-100 flex flex-col items-center justify-center relative px-4">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm mb-2">
                    <span className="text-xl font-bold text-gray-700">
                      {idol.name?.charAt(0) || "?"}
                    </span>
                  </div>
                  {idol.concept && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {idol.concept.split(",").slice(0, 2).map((c: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600 text-[10px] font-medium">
                          {c.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    idol.isDraft ? "bg-gray-200 text-gray-600" : "bg-green-100 text-green-700"
                  }`}>
                    {idol.isDraft ? `Step ${idol.step}/4` : "게시됨"}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900">{idol.name}</h3>
                  {idol.concept && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{idol.concept}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    {idol.isDraft ? (
                      <>
                        <Link href={`/studio/virtual/${idol.id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                          <Pencil className="w-3 h-3" /> 수정
                        </Link>
                        <button onClick={() => handleDelete(idol.id)}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <Link href={`/post/${idol.postId}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-black text-white rounded-xl hover:bg-gray-800 transition-colors">
                        <ExternalLink className="w-3 h-3" /> 피드 보기
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
