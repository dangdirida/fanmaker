"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  UserPlus,
  UserCheck,
  Settings,
  Award,
  Heart,
  Palette,
  Loader2,
} from "lucide-react";
import PostCard from "@/components/feed/PostCard";

// 활동 유형 라벨
const ACTIVITY_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  LIGHT: { label: "라이트 팬", color: "bg-blue-500/20 text-blue-400" },
  CREATIVE: { label: "크리에이티브 팬", color: "bg-purple-500/20 text-purple-400" },
  GLOBAL: { label: "글로벌 팬", color: "bg-green-500/20 text-green-400" },
  CREATOR: { label: "크리에이터", color: "bg-pink-500/20 text-pink-400" },
};

type UserProfile = {
  id: string;
  name: string | null;
  nickname: string | null;
  image: string | null;
  bio: string | null;
  activityType: string;
  role: string;
  isPro: boolean;
  createdAt: string;
};

type ProfileData = {
  user: UserProfile;
  followerCount: number;
  followingCount: number;
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

type BadgeItem = {
  badgeId: string;
  awardedAt: string;
  badge: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
  };
};

const TABS = [
  { key: "posts", label: "창작물", icon: Palette },
  { key: "likes", label: "좋아요", icon: Heart },
  { key: "badges", label: "배지", icon: Award },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { data: session } = useSession();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tab, setTab] = useState<TabKey>("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const isOwnProfile = session?.user?.id === userId;

  // 프로필 데이터 로드
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProfile(d.data);
      })
      .catch(console.error);
  }, [userId]);

  // 탭별 데이터 로드
  const fetchTabData = useCallback(async () => {
    setLoading(true);

    if (tab === "posts") {
      const res = await fetch(`/api/users/${userId}/posts`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
        setNextCursor(data.nextCursor || null);
      }
    } else if (tab === "likes") {
      // 좋아요한 게시물 (리액션 기반)
      const res = await fetch(`/api/users/${userId}/posts?type=liked`);
      const data = await res.json();
      if (data.success) {
        setLikedPosts(data.data);
      }
    } else if (tab === "badges") {
      const res = await fetch(`/api/users/${userId}/badges`);
      const data = await res.json();
      if (data.success) {
        setBadges(data.data);
      }
    }

    setLoading(false);
  }, [userId, tab]);

  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  // 더 불러오기 (무한 스크롤)
  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);

    const res = await fetch(`/api/users/${userId}/posts?cursor=${nextCursor}`);
    const data = await res.json();
    if (data.success) {
      setPosts((prev) => [...prev, ...data.data]);
      setNextCursor(data.nextCursor || null);
    }
    setLoadingMore(false);
  };

  // 팔로우 / 언팔로우
  const handleFollow = async () => {
    if (!session?.user || followLoading) return;
    setFollowLoading(true);

    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProfile((prev) =>
            prev
              ? {
                  ...prev,
                  isFollowing: data.data.following,
                  followerCount:
                    prev.followerCount + (data.data.following ? 1 : -1),
                }
              : prev
          );
        }
      }
    } catch (error) {
      console.error("팔로우 오류:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  // 리액션 핸들러
  const handleReaction = async (postId: string, type: string) => {
    if (!session?.user) return;
    const res = await fetch(`/api/posts/${postId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    if (res.ok) {
      const data = await res.json();
      const updatePosts = (prev: Post[]) =>
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
        });

      if (tab === "posts") setPosts(updatePosts);
      if (tab === "likes") setLikedPosts(updatePosts);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-black animate-spin" />
      </div>
    );
  }

  const { user } = profile;
  const activityInfo = ACTIVITY_TYPE_LABELS[user.activityType] || {
    label: user.activityType,
    color: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* 프로필 헤더 */}
      <div className="w-full h-40 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-400 relative">
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <div className="pt-8 pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* 아바타 */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-black to-gray-700 p-[2px]">
              <div className="w-full h-full rounded-full bg-[#0a0a0a] p-[2px]">
                <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden flex items-center justify-center">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.nickname || "프로필"}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-3xl text-gray-500">
                      {(user.nickname || user.name || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {user.isPro && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-black to-gray-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                PRO
              </span>
            )}
          </div>

          {/* 프로필 정보 */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user.nickname || user.name || "익명 사용자"}
                </h1>
                <span
                  className={`inline-block mt-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${activityInfo.color}`}
                >
                  {activityInfo.label}
                </span>
              </div>

              {/* 액션 버튼 */}
              <div className="sm:ml-auto">
                {isOwnProfile ? (
                  <Link
                    href="/settings/profile"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-gray-700 text-sm text-gray-300 hover:border-gray-600 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    프로필 편집
                  </Link>
                ) : (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                      profile.isFollowing
                        ? "bg-[#1a1a1a] border border-gray-700 text-gray-300 hover:border-red-500/50 hover:text-red-400"
                        : "bg-black text-white hover:bg-gray-800 shadow-lg shadow-[#000000]/20"
                    }`}
                  >
                    {followLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : profile.isFollowing ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    {profile.isFollowing ? "팔로잉" : "팔로우"}
                  </button>
                )}
              </div>
            </div>

            {/* 바이오 */}
            {user.bio && (
              <p className="mt-3 text-sm text-gray-400 leading-relaxed max-w-lg">
                {user.bio}
              </p>
            )}

            {/* 통계 */}
            <div className="flex items-center justify-center sm:justify-start gap-6 mt-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-white">
                  {profile.postCount}
                </p>
                <p className="text-xs text-gray-500">창작물</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">
                  {profile.followerCount}
                </p>
                <p className="text-xs text-gray-500">팔로워</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">
                  {profile.followingCount}
                </p>
                <p className="text-xs text-gray-500">팔로잉</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-800">
        <div className="flex">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                  tab === t.key
                    ? "text-black border-black"
                    : "text-gray-500 border-transparent hover:text-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-black animate-spin" />
          </div>
        ) : (
          <>
            {/* 창작물 탭 */}
            {tab === "posts" && (
              <>
                {posts.length === 0 ? (
                  <div className="text-center py-16">
                    <Palette className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      {isOwnProfile
                        ? "아직 창작물이 없어요. 첫 번째 작품을 만들어보세요!"
                        : "아직 창작물이 없습니다"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onReaction={handleReaction}
                      />
                    ))}
                  </div>
                )}
                {nextCursor && (
                  <div className="text-center mt-6">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-6 py-2.5 rounded-lg bg-[#1a1a1a] border border-gray-800 text-sm text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
                    >
                      {loadingMore ? (
                        <Loader2 className="w-4 h-4 animate-spin inline" />
                      ) : (
                        "더 보기"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* 좋아요 탭 */}
            {tab === "likes" && (
              <>
                {likedPosts.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      {isOwnProfile
                        ? "아직 좋아요한 창작물이 없어요"
                        : "좋아요한 창작물이 없습니다"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {likedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onReaction={handleReaction}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 배지 탭 */}
            {tab === "badges" && (
              <>
                {badges.length === 0 ? (
                  <div className="text-center py-16">
                    <Award className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      {isOwnProfile
                        ? "아직 획득한 배지가 없어요. 활동을 통해 배지를 모아보세요!"
                        : "획득한 배지가 없습니다"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {badges.map((item) => (
                      <div
                        key={item.badgeId}
                        className="bg-[#111] border border-gray-800 rounded-xl p-4 text-center hover:border-gray-700/50 transition-colors"
                      >
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-black/20 to-gray-700/20 flex items-center justify-center overflow-hidden">
                          {item.badge.imageUrl ? (
                            <Image
                              src={item.badge.imageUrl}
                              alt={item.badge.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 object-contain"
                              unoptimized
                            />
                          ) : (
                            <Award className="w-8 h-8 text-gray-700" />
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-white mb-1">
                          {item.badge.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          {item.badge.description}
                        </p>
                        <p className="text-[10px] text-gray-600 mt-2">
                          {new Date(item.awardedAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
