"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2, Sparkles, User } from "lucide-react";

type GalleryIdol = {
  id: string;
  name: string;
  concept: string | null;
  gender: string;
  stylePreset: string;
  hairColor: string;
  skinTone: string;
  eyeColor: string;
  outfitStyle: string;
  thumbnailUrl: string | null;
  createdAt: string;
  user: { id: string; nickname: string | null; image: string | null };
};

const CONCEPT_FILTERS = ["전체", "아이돌", "청순", "파워풀", "다크", "판타지", "레트로", "걸크러시", "시크", "큐트"];

const CONCEPT_GRADIENTS: Record<string, string> = {
  아이돌: "from-pink-400 to-rose-500",
  청순: "from-sky-300 to-blue-400",
  파워풀: "from-red-500 to-orange-500",
  다크: "from-gray-700 to-gray-900",
  판타지: "from-purple-500 to-indigo-500",
  레트로: "from-amber-400 to-yellow-500",
  걸크러시: "from-fuchsia-500 to-pink-600",
  시크: "from-gray-500 to-gray-700",
  큐트: "from-pink-300 to-rose-300",
};

function getConceptGradient(concept: string | null): string {
  if (!concept) return "from-purple-500 to-pink-500";
  for (const [key, val] of Object.entries(CONCEPT_GRADIENTS)) {
    if (concept.includes(key)) return val;
  }
  return "from-purple-500 to-pink-500";
}

export default function VirtualIdolGalleryPage() {
  const [idols, setIdols] = useState<GalleryIdol[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [conceptFilter, setConceptFilter] = useState("전체");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const observerRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchIdols = useCallback(async (reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    const params = new URLSearchParams({ sortBy });
    if (conceptFilter !== "전체") params.set("concept", conceptFilter);
    if (!reset && nextCursor) params.set("cursor", nextCursor);

    try {
      const res = await fetch(`/api/virtual-idols/gallery?${params}`);
      const data = await res.json();
      if (data.success) {
        const fetched = data.data.idols as GalleryIdol[];
        setIdols((prev) => reset ? fetched : [...prev, ...fetched]);
        setNextCursor(data.data.nextCursor);
        setTotal(data.data.total);
      }
    } catch { /* 빈 상태 유지 */ }

    setLoading(false);
    setLoadingMore(false);
  }, [conceptFilter, sortBy, nextCursor]);

  useEffect(() => {
    setIdols([]);
    setNextCursor(null);
    fetchIdols(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conceptFilter, sortBy]);

  // 무한 스크롤
  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && nextCursor && !loadingMore) fetchIdols(); },
      { threshold: 0.5 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore, fetchIdols]);

  // 검색 debounce (클라이언트 필터링)
  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
  };

  const filteredIdols = search.trim()
    ? idols.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : idols;

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-gray-900 px-4 sm:px-6 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-7 h-7 text-purple-300" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">버추얼 아이돌 갤러리</h1>
          </div>
          <p className="text-purple-200/70 text-sm md:text-base">팬메이커 유저들이 만든 가상 아이돌 캐릭터들을 만나보세요</p>
          {total > 0 && (
            <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium backdrop-blur-sm">
              총 {total}명의 캐릭터
            </span>
          )}
        </div>
      </div>

      {/* 검색 & 필터 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* 검색 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
              placeholder="캐릭터 이름 검색..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
          {/* 정렬 */}
          <div className="flex gap-2">
            {(["latest", "popular"] as const).map((s) => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${sortBy === s ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                {s === "latest" ? "최신순" : "인기순"}
              </button>
            ))}
          </div>
        </div>

        {/* 컨셉 필터 칩 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CONCEPT_FILTERS.map((c) => (
            <button key={c} onClick={() => setConceptFilter(c)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${conceptFilter === c ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 animate-pulse">
                <div className="aspect-square" />
                <div className="p-3 space-y-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" /><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" /></div>
              </div>
            ))}
          </div>
        ) : filteredIdols.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              {search ? "검색 결과가 없어요" : conceptFilter !== "전체" ? "조건에 맞는 캐릭터가 없어요" : "아직 캐릭터가 없어요. 첫 번째로 만들어보세요!"}
            </p>
            {search || conceptFilter !== "전체" ? (
              <button onClick={() => { setSearch(""); setConceptFilter("전체"); }} className="px-5 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                필터 초기화
              </button>
            ) : (
              <Link href="/studio/virtual/new" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                첫 캐릭터 만들기
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredIdols.map((idol) => (
              <Link key={idol.id} href={`/studio/virtual/${idol.id}`}>
                <div className="group rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                  {/* 이미지 */}
                  <div className="aspect-square relative overflow-hidden">
                    {idol.thumbnailUrl ? (
                      <Image src={idol.thumbnailUrl} alt={idol.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getConceptGradient(idol.concept)} flex items-center justify-center`}>
                        <span className="text-4xl font-bold text-white/80">{idol.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  {/* 정보 */}
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{idol.name}</h3>
                    {idol.concept && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {idol.concept.split(",").slice(0, 2).map((c, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">{c.trim()}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                        {idol.user.image ? (
                          <Image src={idol.user.image} alt="" width={16} height={16} className="w-full h-full object-cover" unoptimized />
                        ) : (
                          <User className="w-2.5 h-2.5 text-gray-400" />
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{idol.user.nickname || "익명"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 무한 스크롤 트리거 */}
        <div ref={observerRef} className="h-10" />
        {loadingMore && (
          <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        )}
      </div>
    </div>
  );
}
