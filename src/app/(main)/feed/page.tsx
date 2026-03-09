"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import HeroBanner from "@/components/feed/HeroBanner";
import PostCard from "@/components/feed/PostCard";

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

  const allChips = [{ id: "", name: "전체" }, ...artists];

  // 칩이 한 줄을 넘는지 체크
  useEffect(() => {
    if (contentRef.current) {
      const el = contentRef.current;
      setNeedsExpand(el.scrollHeight > 40);
    }
  }, [artists]);

  return (
    <div className="mb-6">
      <div className="relative">
        <div
          ref={contentRef}
          className="flex flex-wrap gap-2 transition-all duration-300 ease-in-out"
          style={{
            maxHeight: expanded ? `${contentRef.current?.scrollHeight || 500}px` : "34px",
            overflow: "hidden",
          }}
        >
          {allChips.map((a) => (
            <button
              key={a.id}
              onClick={() => onSelect(a.id)}
              className={`whitespace-nowrap px-3 py-1.5 text-xs rounded-full border transition-colors ${
                artistId === a.id
                  ? "border-[#c084fc] bg-[#c084fc]/10 text-[#c084fc]"
                  : "border-gray-700 text-gray-500 hover:border-gray-600"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
        {/* 접혀있을 때 그라데이션 페이드 */}
        {!expanded && needsExpand && (
          <div className="absolute right-0 top-0 h-[34px] w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
        )}
      </div>
      {needsExpand && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
        >
          {expanded ? "접기 ▲" : `더보기 ▼ (${artists.length}개 아티스트)`}
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
  const observerRef = useRef<HTMLDivElement>(null);

  // 아티스트 목록 로드
  useEffect(() => {
    fetch("/api/artists")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setArtists(data.data);
      });
  }, []);

  // 게시물 로드
  const fetchPosts = useCallback(
    async (pageNum: number, reset = false) => {
      if (loading) return;
      setLoading(true);

      const params = new URLSearchParams({
        tab,
        category,
        artistId,
        sort,
        page: String(pageNum),
        limit: "20",
      });

      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();

      if (data.success) {
        setPosts((prev) => (reset ? data.data : [...prev, ...data.data]));
        setHasMore(pageNum < data.pagination.totalPages);
      }
      setLoading(false);
    },
    [tab, category, artistId, sort, loading]
  );

  // 필터 변경 시 리셋
  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    fetchPosts(1, true);
  }, [tab, category, artistId, sort]);

  // Intersection Observer 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage);
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page]);

  // 반응 토글
  const handleReaction = async (postId: string, type: string) => {
    if (!session?.user) return;

    const res = await fetch(`/api/posts/${postId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });

    if (res.ok) {
      const data = await res.json();
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const added = data.data.action === "added";
          return {
            ...p,
            reactionCount: p.reactionCount + (added ? 1 : -1),
            myReactions: added
              ? [...p.myReactions, type]
              : p.myReactions.filter((r) => r !== type),
          };
        })
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <HeroBanner />

      {/* 탭 */}
      <div className="flex items-center gap-1 mt-8 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              tab === t.key
                ? "bg-[#ff3d7f] text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none"
        >
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
        </select>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`whitespace-nowrap px-3 py-1.5 text-xs rounded-full border transition-colors ${
              category === c.key
                ? "border-[#ff3d7f] bg-[#ff3d7f]/10 text-[#ff3d7f]"
                : "border-gray-700 text-gray-400 hover:border-gray-600"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 아티스트 필터 */}
      <ArtistFilter
        artists={artists}
        artistId={artistId}
        onSelect={setArtistId}
      />

      {/* 게시물 그리드 */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onReaction={handleReaction} />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center text-gray-500 py-20">
            아직 창작물이 없어요. 첫 작품을 올려보세요!
          </div>
        )
      )}

      {/* 무한 스크롤 트리거 */}
      <div ref={observerRef} className="h-10" />
      {loading && (
        <div className="text-center text-gray-500 py-4">로딩 중...</div>
      )}
    </div>
  );
}
