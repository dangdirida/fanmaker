"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Users,
  FileText,
  ExternalLink,
} from "lucide-react";
import PostCard from "@/components/feed/PostCard";

type ArtistDetail = {
  id: string;
  name: string;
  nameEn: string | null;
  agency: string | null;
  groupImageUrl: string | null;
  description: string | null;
  debutDate: string | null;
  sns: { youtube?: string; instagram?: string; twitter?: string; tiktok?: string } | null;
  members: { name: string; position?: string }[] | null;
  followerCount: number;
  postCount: number;
  isFollowing: boolean;
};

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

const TABS = [
  { key: "highlight", label: "Highlight" },
  { key: "fan", label: "Fan" },
  { key: "notice", label: "Notice" },
];

export default function ArtistPage() {
  const { artistId } = useParams<{ artistId: string }>();
  const { data: session } = useSession();
  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [tab, setTab] = useState("highlight");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/artists/${artistId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setArtist(d.data); });
  }, [artistId]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const sort = tab === "highlight" ? "popular" : "latest";
    const res = await fetch(`/api/artists/${artistId}/posts?sort=${sort}&limit=30`);
    const data = await res.json();
    if (data.success) setPosts(data.data);
    setLoading(false);
  }, [artistId, tab]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleFollow = async () => {
    if (!session?.user) return;
    const res = await fetch(`/api/artists/${artistId}/follow`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setArtist((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: data.data.action === "followed",
              followerCount: prev.followerCount + (data.data.action === "followed" ? 1 : -1),
            }
          : prev
      );
    }
  };

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

  if (!artist) {
    return <div className="text-center text-gray-500 py-20">로딩 중...</div>;
  }

  return (
    <div>
      {/* 히어로 섹션 */}
      <div className="relative h-[300px] md:h-[400px] bg-gradient-to-b from-[#1a1a2e] to-[#0a0a0a] overflow-hidden">
        {artist.groupImageUrl && (
          <img
            src={artist.groupImageUrl}
            alt={artist.name}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-end h-full pb-8 px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {artist.name}
          </h1>
          {artist.nameEn && artist.nameEn !== artist.name && (
            <p className="text-gray-400 text-sm mb-4">{artist.nameEn}</p>
          )}
          <button
            onClick={handleFollow}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              artist.isFollowing
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-[#ff3d7f] text-white hover:bg-[#e6356f]"
            }`}
          >
            {artist.isFollowing ? "팔로잉" : "팔로우"}
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="sticky top-14 z-20 bg-[#0a0a0a] border-b border-gray-800">
        <div className="max-w-5xl mx-auto flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-medium text-center transition-colors border-b-2 ${
                tab === t.key
                  ? "text-[#ff3d7f] border-[#ff3d7f]"
                  : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 좌: 피드 */}
          <div className="flex-1 min-w-0">
            {tab === "notice" ? (
              <div className="text-center text-gray-500 py-16">
                공지사항이 없습니다
              </div>
            ) : loading ? (
              <div className="text-center text-gray-500 py-16">로딩 중...</div>
            ) : posts.length === 0 ? (
              <div className="text-center text-gray-500 py-16">
                아직 창작물이 없어요
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onReaction={handleReaction} />
                ))}
              </div>
            )}
          </div>

          {/* 우: 아티스트 정보 패널 (데스크톱) */}
          <div className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="sticky top-28 space-y-4">
              <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
                <div className="w-16 h-16 rounded-full bg-gray-800 mx-auto mb-3 flex items-center justify-center text-2xl overflow-hidden">
                  {artist.groupImageUrl ? (
                    <img src={artist.groupImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    artist.name.charAt(0)
                  )}
                </div>
                <h3 className="text-center text-white font-medium">{artist.name}</h3>
                {artist.agency && (
                  <p className="text-center text-gray-500 text-xs mt-1">{artist.agency}</p>
                )}

                <div className="flex justify-center gap-6 mt-4 text-center">
                  <div>
                    <p className="text-white font-medium text-sm">{artist.followerCount}</p>
                    <p className="text-gray-500 text-[10px]">팔로워</p>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{artist.postCount}</p>
                    <p className="text-gray-500 text-[10px]">창작물</p>
                  </div>
                </div>

                {/* SNS 링크 */}
                {artist.sns && (
                  <div className="flex justify-center gap-3 mt-4">
                    {artist.sns.youtube && (
                      <a href={artist.sns.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {artist.sns.instagram && (
                      <a href={artist.sns.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-400">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* 멤버 목록 */}
              {artist.members && Array.isArray(artist.members) && artist.members.length > 0 && (
                <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    멤버
                  </h4>
                  <div className="space-y-2">
                    {(artist.members as { name: string; position?: string }[]).map((member, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{member.name}</span>
                        {member.position && (
                          <span className="text-[10px] text-gray-500">{member.position}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {artist.description && (
                <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    소개
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{artist.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
