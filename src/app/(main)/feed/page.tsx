"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import HeroBanner from "@/components/feed/HeroBanner";
import PostCard from "@/components/feed/PostCard";
import { MOCK_POSTS, type MockPost } from "@/lib/mockPosts";

const TABS = [
  { key: "all", label: "전체" },
  { key: "following", label: "팔로잉" },
  { key: "trending", label: "트렌딩" },
];

const CATEGORIES = [
  { key: "", label: "전체" },
  { key: "REMIX", label: "리믹스" },
  { key: "VIRTUAL", label: "버추얼" },
  { key: "CONCEPT", label: "컨셉" },
  { key: "PERFORMANCE", label: "퍼포먼스" },
  { key: "IDOL_PROJECT", label: "아이돌 프로젝트" },
  { key: "GLOBAL_SYNC", label: "글로벌 싱크" },
];

const DEFAULT_ARTISTS = [
  "BTS",
  "BLACKPINK",
  "aespa",
  "SEVENTEEN",
  "NewJeans",
  "IVE",
  "Stray Kids",
  "TWICE",
  "EXO",
  "NCT WISH",
  "LE SSERAFIM",
  "ITZY",
  "TXT",
  "ENHYPEN",
  "Red Velvet",
  "(G)I-DLE",
  "ATEEZ",
  "NMIXX",
  "RIIZE",
  "ILLIT",
];

type Artist = { id: string; name: string };
type Post = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  thumbnailUrl: string | null;
  viewCount: number;
  createdAt: string;
  author: { id: string; nickname: string | null; image: string | null };
  artist: { id: string; name: string } | null;
  reactionCount: number;
  commentCount: number;
  myReactions: string[];
  gradient?: string;
  cheerCount?: number;
  aiScore?: number;
};

function ArtistFilter({
  artists,
  artistId,
  onSelect,
}: {
  artists: Artist[];
  artistId: string;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [needsExpand, setNeedsExpand] = useState(false);

  const displayArtists =
    artists.length > 0
      ? artists
      : DEFAULT_ARTISTS.map((name, i) => ({ id: `default-${i}`, name }));

  const allChips = [{ id: "", name: "전체 아티스트" }, ...displayArtists];

  useEffect(() => {
    if (contentRef.current) {
      setNeedsExpand(contentRef.current.scrollHeight > 44);
    }
  }, [displayArtists]);

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className="flex flex-wrap gap-2 overflow-hidden transition-all duration-300 pb-2"
        style={{
          maxHeight: expanded
            ? `${contentRef.current?.scrollHeight || 500}px`
            : "40px",
        }}
      >
        {allChips.map((a) => (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              artistId === a.id
                ? "bg-black text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>
      {!expanded && needsExpand && (
        <div className="absolute right-0 top-0 h-[40px] w-20 bg-gradient-to-l from-white dark:from-[#0a0a0a] to-transparent pointer-events-none" />
      )}
      {needsExpand && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {expanded
            ? "접기 ▲"
            : `더보기 ▼ (${displayArtists.length}개 아티스트)`}
        </button>
      )}
    </div>
  );
}

export default function FeedPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState("all");
  const [category, setCategory] = useState("");
  const [artistId, setArtistId] = useState("");
  const [sort, setSort] = useState("latest");
  const [posts, setPosts] = useState<Post[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [useMock, setUseMock] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // 아티스트 목록 로드
  useEffect(() => {
    fetch("/api/artists")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setArtists(data.data);
      })
      .catch(() => {});
  }, []);

  // 게시물 로드
  const fetchPosts = useCallback(
    async (pageNum: number, reset = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);

      const params = new URLSearchParams({
        tab,
        category,
        artistId,
        sort,
        page: String(pageNum),
        limit: "20",
      });

      try {
        const res = await fetch(`/api/posts?${params}`);
        const data = await res.json();

        if (data.success) {
          setPosts((prev) => {
            const apiPosts = reset ? data.data : [...prev, ...data.data];
            if (apiPosts.length === 0 && pageNum === 1) {
              setUseMock(true);
            } else {
              setUseMock(false);
            }
            return apiPosts;
          });
          setHasMore(pageNum < data.pagination.totalPages);
          setTotalCount(data.pagination.total);
        }
      } catch {
        setUseMock(true);
      }
      loadingRef.current = false;
      setLoading(false);
    },
    [tab, category, artistId, sort]
  );

  // 필터 변경 시 리셋
  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    setUseMock(false);
    fetchPosts(1, true);
  }, [fetchPosts]);

  // Intersection Observer 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current && !useMock) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage);
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, page, useMock, fetchPosts]);

  // 목데이터 필터링
  const getFilteredMockPosts = (): MockPost[] => {
    let filtered = [...MOCK_POSTS];
    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (artistId) {
      const artistName = DEFAULT_ARTISTS.find(
        (_, i) => `default-${i}` === artistId
      );
      if (artistName) {
        filtered = filtered.filter((p) => p.artist?.name === artistName);
      }
    }
    if (sort === "popular") {
      filtered.sort((a, b) => b.reactionCount - a.reactionCount);
    }
    return filtered;
  };

  // 반응 토글
  const handleReaction = async (postId: string, type: string) => {
    if (!session?.user) return;
    if (useMock) return;

    // ★ Optimistic UI - API 응답 전에 즉시 UI 업데이트
    const isCurrentlyLiked = posts.find(p => p.id === postId)?.myReactions.includes(type);
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const added = !isCurrentlyLiked;
        return {
          ...p,
          reactionCount: p.reactionCount + (added ? 1 : -1),
          myReactions: added
            ? [...p.myReactions, type]
            : p.myReactions.filter((r) => r !== type),
        };
      })
    );

    // 백그라운드에서 API 호출
    try {
      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) {
        // 실패 시 롤백
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              reactionCount: p.reactionCount + (isCurrentlyLiked ? 1 : -1),
              myReactions: isCurrentlyLiked
                ? [...p.myReactions, type]
                : p.myReactions.filter((r) => r !== type),
            };
          })
        );
      }
    } catch {
      // 네트워크 오류 시 롤백
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            reactionCount: p.reactionCount + (isCurrentlyLiked ? 1 : -1),
            myReactions: isCurrentlyLiked
              ? [...p.myReactions, type]
              : p.myReactions.filter((r) => r !== type),
          };
        })
      );
    }
  };

  const displayPosts = useMock ? getFilteredMockPosts() : posts;
  const displayCount = useMock ? displayPosts.length : totalCount;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* 히어로 배너 */}
      <div className="mb-8">
        <HeroBanner />
      </div>

      {/* 탭 */}
      <div className="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 font-medium transition-colors relative ${
              tab === t.key
                ? "text-black"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
            }`}
          >
            {t.label}
            {tab === t.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
        ))}
      </div>

      {/* 필터 영역 */}
      <div className="mb-6 space-y-4">
        {/* 콘텐츠 타입 필터 칩 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === c.key
                  ? "bg-black text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* 아티스트 필터 칩 */}
        <ArtistFilter
          artists={artists}
          artistId={artistId}
          onSelect={setArtistId}
        />

        {/* 카운트 + 정렬 */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {displayCount > 0 ? `${displayCount}개의 창작물` : ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSort("latest")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                sort === "latest"
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setSort("popular")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                sort === "popular"
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
              }`}
            >
              인기순
            </button>
          </div>
        </div>
      </div>

      {/* 게시물 그리드 */}
      {displayPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayPosts.map((post) => (
            <PostCard key={post.id} post={post} onReaction={handleReaction} />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center text-gray-400 py-20">
            아직 창작물이 없어요. 첫 작품을 올려보세요!
          </div>
        )
      )}

      {/* 무한 스크롤 트리거 */}
      {!useMock && <div ref={observerRef} className="h-10" />}
      {loading && (
        <div className="text-center text-gray-400 py-4">로딩 중...</div>
      )}
    </div>
  );
}
