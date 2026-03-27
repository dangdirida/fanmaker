"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  UserPlus,
  UserCheck,
  Heart,
  Palette,
  Loader2,
  Award,
  Camera,
  Calendar,
  ImagePlus,
  X,
  Eye,
  Sparkles,
  TrendingUp,
  Gamepad2,
  Globe,
  Star,
  Lock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ━━━━ 상수 ━━━━

const ACTIVITY_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  LIGHT: { label: "라이트 팬", color: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" },
  CREATIVE: { label: "크리에이티브 팬", color: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" },
  GLOBAL: { label: "글로벌 팬", color: "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" },
  CREATOR: { label: "크리에이터", color: "bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400" },
};

const DEFAULT_BADGES = [
  { id: "first-creation", name: "첫 창작", description: "첫 번째 창작물 게시 시 획득", icon: Sparkles, color: "from-yellow-400 to-orange-500" },
  { id: "popular-creator", name: "인기 창작자", description: "좋아요 10개 이상 획득", icon: TrendingUp, color: "from-pink-500 to-rose-500" },
  { id: "idol-producer", name: "아이돌 프로듀서", description: "아이돌 키우기 첫 엔딩 달성", icon: Gamepad2, color: "from-purple-500 to-indigo-500" },
  { id: "global-fan", name: "글로벌 팬", description: "글로벌 싱크 사용 시 획득", icon: Globe, color: "from-blue-500 to-cyan-500" },
  { id: "virtual-artist", name: "버추얼 아티스트", description: "버추얼 아이돌 3개 이상 생성", icon: Star, color: "from-emerald-500 to-teal-500" },
];

const CATEGORY_COLORS: Record<string, string> = {
  VIRTUAL: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  CONCEPT: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  PERFORMANCE: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
  IDOL_PROJECT: "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400",
  GLOBAL_SYNC: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
};

const CATEGORY_LABELS: Record<string, string> = {
  VIRTUAL: "버추얼", CONCEPT: "컨셉", PERFORMANCE: "퍼포먼스",
  IDOL_PROJECT: "프로젝트", GLOBAL_SYNC: "글로벌",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  VIRTUAL: "from-blue-400 to-cyan-500", CONCEPT: "from-purple-500 to-pink-500",
  PERFORMANCE: "from-red-500 to-orange-400", IDOL_PROJECT: "from-green-500 to-emerald-400",
  GLOBAL_SYNC: "from-orange-400 to-yellow-400",
};

// ━━━━ 타입 ━━━━

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
  badge: { id: string; name: string; description: string; imageUrl: string };
};

const TABS = [
  { key: "posts", label: "창작물", icon: Palette },
  { key: "likes", label: "좋아요", icon: Heart },
  { key: "badges", label: "배지", icon: Award },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ━━━━ 이미지 업로드 유틸 ━━━━

async function uploadImage(userId: string, file: File, type: "profile" | "cover"): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `users/${userId}/${type}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("images").upload(path, file, { upsert: true });
  if (error) { console.error("Upload error:", error); return null; }
  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return data.publicUrl;
}

// ━━━━ 메인 컴포넌트 ━━━━

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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<"profile" | "cover" | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const isOwnProfile = session?.user?.id === userId;

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setProfile(d.data); })
      .catch(console.error);
  }, [userId]);

  const fetchTabData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "posts") {
        const res = await fetch(`/api/users/${userId}/posts`);
        const data = await res.json();
        if (data.success) { setPosts(data.data); setNextCursor(data.nextCursor || null); }
      } else if (tab === "likes") {
        const res = await fetch(`/api/users/${userId}/posts?type=liked`);
        const data = await res.json();
        if (data.success) setLikedPosts(data.data);
      } else if (tab === "badges") {
        const res = await fetch(`/api/users/${userId}/badges`);
        const data = await res.json();
        if (data.success) setBadges(data.data);
      }
    } catch { /* 빈 상태 유지 */ }
    setLoading(false);
  }, [userId, tab]);

  useEffect(() => { fetchTabData(); }, [fetchTabData]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const res = await fetch(`/api/users/${userId}/posts?cursor=${nextCursor}`);
    const data = await res.json();
    if (data.success) { setPosts((prev) => [...prev, ...data.data]); setNextCursor(data.nextCursor || null); }
    setLoadingMore(false);
  };

  const handleFollow = async () => {
    if (!session?.user || followLoading) return;
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProfile((prev) => prev ? {
            ...prev, isFollowing: data.data.following,
            followerCount: prev.followerCount + (data.data.following ? 1 : -1),
          } : prev);
        }
      }
    } catch (error) { console.error("팔로우 오류:", error); }
    finally { setFollowLoading(false); }
  };

  const _handleReaction = async (postId: string, type: string) => {
    if (!session?.user) return;
    const res = await fetch(`/api/posts/${postId}/reactions`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type }),
    });
    if (res.ok) {
      const data = await res.json();
      const updatePosts = (prev: Post[]) => prev.map((p) => {
        if (p.id !== postId) return p;
        const added = data.data.action === "added";
        return { ...p, reactionCount: p.reactionCount + (added ? 1 : -1), myReactions: added ? [...p.myReactions, type] : p.myReactions.filter((r) => r !== type) };
      });
      if (tab === "posts") setPosts(updatePosts);
      if (tab === "likes") setLikedPosts(updatePosts);
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (file: File, type: "profile" | "cover") => {
    if (!isOwnProfile) return;
    setUploadingImage(type);

    if (type === "cover") {
      setCoverPreview(URL.createObjectURL(file));
    }

    const url = await uploadImage(userId, file, type);
    if (url) {
      const body = type === "profile" ? { image: url } : { coverImage: url };
      await fetch(`/api/users/${userId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (type === "profile") {
        setProfile((prev) => prev ? { ...prev, user: { ...prev.user, image: url } } : prev);
      }
    }
    setUploadingImage(null);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  const { user } = profile;
  const activityInfo = ACTIVITY_TYPE_LABELS[user.activityType] || { label: user.activityType, color: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400" };
  const joinDate = new Date(user.createdAt);
  const joinDateStr = `${joinDate.getFullYear()}년 ${joinDate.getMonth() + 1}월 가입`;
  const tabCounts: Record<TabKey, number> = { posts: profile.postCount, likes: likedPosts.length, badges: badges.length };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* ━━━ 커버 이미지 ━━━ */}
      <div className="relative w-full h-[200px] md:h-[280px] bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {coverPreview ? (
          <img src={coverPreview} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-rose-400/20 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-rose-900/40" />
        )}
        {isOwnProfile && (
          <>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "cover"); }} />
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-3 right-3 w-9 h-9 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-gray-700 transition-colors z-10 backdrop-blur-sm"
            >
              {uploadingImage === "cover" ? <Loader2 className="w-4 h-4 animate-spin text-gray-600" /> : <Camera className="w-4 h-4 text-gray-700 dark:text-gray-300" />}
            </button>
          </>
        )}
      </div>

      {/* ━━━ 프로필 정보 영역 ━━━ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* 프로필 사진 + 액션 버튼 Row */}
        <div className="flex items-end justify-between -mt-12 md:-mt-16">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-[#0a0a0a] overflow-hidden bg-purple-500 flex items-center justify-center shadow-lg">
              {user.image ? (
                <Image src={user.image} alt={user.nickname || "프로필"} width={128} height={128} className="w-full h-full object-cover" unoptimized />
              ) : (
                <span className="text-3xl md:text-4xl font-bold text-white">{(user.nickname || user.name || "?").charAt(0).toUpperCase()}</span>
              )}
            </div>
            {user.isPro && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">PRO</span>
            )}
            {isOwnProfile && (
              <>
                <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "profile"); }} />
                <button
                  onClick={() => profileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 md:w-8 md:h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {uploadingImage === "profile" ? <Loader2 className="w-3 h-3 animate-spin text-gray-600" /> : <Camera className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />}
                </button>
              </>
            )}
          </div>

          <div className="pb-2">
            {isOwnProfile ? (
              <button onClick={() => setEditModalOpen(true)} className="px-5 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                프로필 편집
              </button>
            ) : (
              <button onClick={handleFollow} disabled={followLoading} className={`inline-flex items-center gap-1.5 px-6 py-2 rounded-full text-sm font-semibold transition-all ${profile.isFollowing ? "border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-red-300 hover:text-red-500" : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"}`}>
                {followLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : profile.isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {profile.isFollowing ? "팔로잉" : "팔로우"}
              </button>
            )}
          </div>
        </div>

        {/* 프로필 정보 - 데스크톱에서는 flex row */}
        <div className="mt-4 md:flex md:items-start md:gap-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{user.nickname || user.name || "익명 사용자"}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{user.nickname || user.name || "user"}</p>
            <span className={`inline-block mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${activityInfo.color}`}>{activityInfo.label}</span>

            {/* 자기소개 */}
            <div className="mt-3">
              {user.bio ? (
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{user.bio}</p>
              ) : isOwnProfile ? (
                <p className="text-sm text-gray-400 italic cursor-pointer hover:text-gray-500 transition-colors" onClick={() => setEditModalOpen(true)}>자기소개를 입력해보세요</p>
              ) : null}
              <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5" /><span>{joinDateStr}</span>
              </div>
            </div>
          </div>

          {/* 통계 - 데스크톱에서 우측 배치 */}
          <div className="flex items-center gap-6 mt-4 md:mt-1 py-3 md:py-0">
            <button className="text-center" onClick={() => setTab("posts")}>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.postCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">창작물</p>
            </button>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 md:hidden" />
            <button className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.followerCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">팔로워</p>
            </button>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 md:hidden" />
            <button className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.followingCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">팔로잉</p>
            </button>
          </div>
        </div>

        {/* 모바일 통계 구분선 */}
        <div className="border-b border-gray-100 dark:border-gray-800 mt-4 md:mt-6" />
      </div>

      {/* ━━━ 탭 내비게이션 ━━━ */}
      <div className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#0a0a0a] z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex">
            {TABS.map((t) => {
              const Icon = t.icon;
              const count = tabCounts[t.key];
              return (
                <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 md:flex-none md:px-6 flex items-center justify-center gap-1.5 py-3.5 text-sm font-medium transition-colors relative ${tab === t.key ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                  <Icon className="w-4 h-4" />
                  {t.label}
                  {count > 0 && (
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>{count}</span>
                  )}
                  {tab === t.key && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gray-900 dark:bg-white rounded-full" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ━━━ 탭 콘텐츠 ━━━ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
        ) : (
          <>
            {tab === "posts" && (
              <>
                {posts.length === 0 ? (
                  <div className="text-center py-16">
                    <ImagePlus className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">아직 창작물이 없어요</p>
                    {isOwnProfile && (
                      <Link href="/studio/virtual" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">첫 창작물 만들기</Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {posts.map((post) => (<PostGridCard key={post.id} post={post} />))}
                  </div>
                )}
                {nextCursor && (
                  <div className="text-center mt-6">
                    <button onClick={loadMore} disabled={loadingMore} className="px-6 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                      {loadingMore ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "더 보기"}
                    </button>
                  </div>
                )}
              </>
            )}

            {tab === "likes" && (
              <>
                {likedPosts.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{isOwnProfile ? "아직 좋아요한 창작물이 없어요" : "좋아요한 창작물이 없습니다"}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {likedPosts.map((post) => (<PostGridCard key={post.id} post={post} />))}
                  </div>
                )}
              </>
            )}

            {tab === "badges" && <BadgeGrid badges={badges} />}
          </>
        )}
      </div>

      {editModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditModalOpen(false)}
          onSave={(updated) => { setProfile((prev) => prev ? { ...prev, user: { ...prev.user, ...updated } } : prev); setEditModalOpen(false); }}
        />
      )}
    </div>
  );
}

// ━━━━ PostGridCard ━━━━

function PostGridCard({ post }: { post: Post }) {
  const [hovered, setHovered] = useState(false);
  const gradient = CATEGORY_GRADIENTS[post.category] || "from-gray-400 to-gray-600";
  const catLabel = CATEGORY_LABELS[post.category] || post.category;
  const catColor = CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400";

  return (
    <Link href={`/post/${post.id}`}>
      <div className="group relative rounded-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div className="aspect-square relative overflow-hidden">
          {post.thumbnailUrl ? (
            <Image src={post.thumbnailUrl} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}><Palette className="w-8 h-8 text-white/60" /></div>
          )}
          <div className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-4 transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`}>
            <div className="flex items-center gap-1 text-white text-sm"><Heart className="w-4 h-4 fill-white" /><span>{post.reactionCount}</span></div>
            <div className="flex items-center gap-1 text-white text-sm"><Eye className="w-4 h-4" /><span>{post.viewCount}</span></div>
          </div>
        </div>
        <div className="p-2.5">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{post.title}</p>
          <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${catColor}`}>{catLabel}</span>
        </div>
      </div>
    </Link>
  );
}

// ━━━━ BadgeGrid ━━━━

function BadgeGrid({ badges }: { badges: BadgeItem[] }) {
  const earnedIds = new Set(badges.map((b) => b.badgeId));

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {DEFAULT_BADGES.map((badge) => {
        const earned = earnedIds.has(badge.id);
        const earnedData = badges.find((b) => b.badgeId === badge.id);
        const Icon = badge.icon;
        return (
          <div key={badge.id} className={`text-center p-3 md:p-4 rounded-2xl border transition-colors ${earned ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700" : "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-50"}`}>
            <div className="relative mx-auto w-12 h-12 md:w-14 md:h-14 mb-2">
              <div className={`w-full h-full rounded-full flex items-center justify-center ${earned ? `bg-gradient-to-br ${badge.color}` : "bg-gray-200 dark:bg-gray-700"}`}>
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${earned ? "text-white" : "text-gray-400 dark:text-gray-500"}`} />
              </div>
              {!earned && <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center"><Lock className="w-3 h-3 text-gray-500 dark:text-gray-400" /></div>}
            </div>
            <h4 className={`text-xs font-semibold mb-0.5 ${earned ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>{badge.name}</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{badge.description}</p>
            {earned && earnedData && <p className="text-[9px] text-gray-400 mt-1">{new Date(earnedData.awardedAt).toLocaleDateString("ko-KR")}</p>}
          </div>
        );
      })}
      {badges.filter((b) => !DEFAULT_BADGES.some((d) => d.id === b.badgeId)).map((item) => (
        <div key={item.badgeId} className="text-center p-3 md:p-4 rounded-2xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <div className="mx-auto w-12 h-12 md:w-14 md:h-14 mb-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden">
            {item.badge.imageUrl ? <Image src={item.badge.imageUrl} alt={item.badge.name} width={32} height={32} className="w-8 h-8 object-contain" unoptimized /> : <Award className="w-6 h-6 text-white" />}
          </div>
          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">{item.badge.name}</h4>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{item.badge.description}</p>
          <p className="text-[9px] text-gray-400 mt-1">{new Date(item.awardedAt).toLocaleDateString("ko-KR")}</p>
        </div>
      ))}
    </div>
  );
}

// ━━━━ EditProfileModal ━━━━

function EditProfileModal({ user, onClose, onSave }: { user: UserProfile; onClose: () => void; onSave: (updated: Partial<UserProfile>) => void }) {
  const [nickname, setNickname] = useState(user.nickname || "");
  const [bio, setBio] = useState(user.bio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleSave = async () => {
    if (!nickname.trim()) { setError("닉네임을 입력해주세요"); return; }
    if (nickname.length > 20) { setError("닉네임은 20자 이하로 입력해주세요"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nickname: nickname.trim(), bio: bio.trim() }) });
      const data = await res.json();
      if (data.success) { onSave({ nickname: nickname.trim(), bio: bio.trim() }); } else { setError(data.error || "저장에 실패했습니다"); }
    } catch { setError("네트워크 오류가 발생했습니다"); }
    finally { setSaving(false); }
  };

  return (
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => e.target === backdropRef.current && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">프로필 편집</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">닉네임</label>
            <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={20} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" placeholder="닉네임 (최대 20자)" />
            <p className="text-xs text-gray-400 mt-1 text-right">{nickname.length}/20</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">자기소개</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={150} rows={3} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none" placeholder="자기소개를 입력하세요" />
            <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/150</p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">취소</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
