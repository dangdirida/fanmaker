"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const VRMStaticPreview = dynamic(() => import("@/components/feed/VRMStaticPreview"), { ssr: false });

import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Eye,
  Megaphone,
  Sparkle,
  User,
  Music,
  Sparkles,
  Palette,
  Zap,
  Star,
  Globe,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

// 카테고리별 그라디언트 + 뱃지 스타일
const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    gradient: string;
    badgeGradient: string;
    accentColor: string;
    icon: typeof Music;
  }
> = {
  REMIX: {
    label: "리믹스",
    gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
    badgeGradient: "from-violet-500 to-fuchsia-500",
    accentColor: "text-purple-600 dark:text-purple-400",
    icon: Music,
  },
  VIRTUAL: {
    label: "버추얼",
    gradient: "from-cyan-500 via-sky-500 to-blue-600",
    badgeGradient: "from-cyan-500 to-blue-500",
    accentColor: "text-cyan-600 dark:text-cyan-400",
    icon: Sparkles,
  },
  CONCEPT: {
    label: "컨셉",
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    badgeGradient: "from-orange-500 to-amber-500",
    accentColor: "text-orange-600 dark:text-orange-400",
    icon: Palette,
  },
  PERFORMANCE: {
    label: "퍼포먼스",
    gradient: "from-rose-500 via-pink-500 to-red-500",
    badgeGradient: "from-rose-500 to-red-500",
    accentColor: "text-rose-600 dark:text-rose-400",
    icon: Zap,
  },
  IDOL_PROJECT: {
    label: "아이돌 프로젝트",
    gradient: "from-emerald-500 via-teal-500 to-green-500",
    badgeGradient: "from-emerald-500 to-green-500",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    icon: Star,
  },
  GLOBAL_SYNC: {
    label: "글로벌 싱크",
    gradient: "from-blue-600 via-indigo-500 to-violet-500",
    badgeGradient: "from-blue-500 to-indigo-500",
    accentColor: "text-blue-600 dark:text-blue-400",
    icon: Globe,
  },
};

const DEFAULT_CONFIG = {
  label: "기타",
  gradient: "from-gray-600 via-gray-500 to-gray-400",
  badgeGradient: "from-gray-500 to-gray-600",
  accentColor: "text-gray-600 dark:text-gray-400",
  icon: Music,
};

interface PostCardProps {
  post: {
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
    cheerCount?: number;
    aiScore?: number;
    gradient?: string;
    contentData?: Record<string, unknown>;
    authorId?: string;
  };
  onReaction: (postId: string, type: string) => void;
  currentUserId?: string;
}


function VirtualThumbnail({ contentData }: { contentData?: Record<string, unknown> }) {
  const [vrmData, setVrmData] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    if (!contentData) return;
    const data = contentData as Record<string, string>;
    if (data.hairColor && data.skinTone && data.eyeColor && data.gender) {
      setVrmData({ hairColor: data.hairColor, skinTone: data.skinTone, eyeColor: data.eyeColor, outfitStyle: data.outfitStyle || "casual", gender: data.gender });
      return;
    }
    if (!data.virtualIdolId) return;
    fetch("/api/virtual-idols/preview?id=" + data.virtualIdolId)
      .then(r => r.json())
      .then(d => { if (d.success) setVrmData(d.data); })
      .catch(() => {});
  }, [contentData]);

  if (!vrmData) return (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <VRMStaticPreview
        gender={vrmData.gender}
        hairColor={vrmData.hairColor}
        skinTone={vrmData.skinTone}
        eyeColor={vrmData.eyeColor}
        outfitStyle={vrmData.outfitStyle}
        width={320}
        height={240}
      />
    </div>
  );
}

export default function PostCard({ post, onReaction, currentUserId }: PostCardProps) {
  const config = CATEGORY_CONFIG[post.category] || DEFAULT_CONFIG;
  const IconComponent = config.icon;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("게시물을 삭제할까요?")) return;
    await fetch("/api/posts/" + post.id, { method: "DELETE" });
    window.location.reload();
  };
  const likeCount = post.reactionCount;
  const cheerCount = post.cheerCount ?? Math.floor(post.reactionCount * 0.7);
  const aiScore = post.aiScore ?? Math.floor(post.reactionCount * 0.3);

  return (
    <Link
      href={`/post/${post.id}`}
      className="group block cursor-pointer bg-white dark:bg-[#111111] rounded-2xl overflow-hidden border border-gray-200/80 dark:border-gray-800/80 shadow-sm hover:shadow-xl hover:shadow-black/8 dark:hover:shadow-black/30 hover:scale-[1.02] hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 ease-out"
    >
      {/* 썸네일 */}
      <div className="aspect-video relative overflow-hidden">
        {currentUserId && currentUserId === post.authorId && (
          <button onClick={handleDelete} className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs transition-colors">
            ✕
          </button>
        )}
        {post.category === 'VIRTUAL' && post.contentData ? (
          <VirtualThumbnail contentData={post.contentData as Record<string, unknown>} />
        ) : post.thumbnailUrl ? (
          post.thumbnailUrl.startsWith('data:') || post.thumbnailUrl.includes('pollinations') ? (
            <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out" />
          ) : (
            <Image src={post.thumbnailUrl} alt={post.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out w-full h-full" unoptimized />
          )
        ) : post.thumbnailUrl ? null : post.contentData && (post.contentData as Record<string, unknown>).youtubeUrl ? (
          <img
            src={`https://img.youtube.com/vi/${((post.contentData as Record<string, unknown>).youtubeUrl as string).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/)?.[1]}/hqdefault.jpg`}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${config.gradient} relative group-hover:scale-105 transition-transform duration-500 ease-out`}
          >
            {/* 장식 패턴 */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-32 h-32 rounded-full border border-white/30" />
              <div className="absolute top-8 right-8 w-20 h-20 rounded-full border border-white/20" />
              <div className="absolute bottom-6 left-6 w-24 h-24 rounded-full border border-white/15" />
              <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-white/10" />
            </div>
            {/* 메쉬 그라디언트 오버레이 */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 50% 60% at 70% 40%, rgba(255,255,255,0.15) 0%, transparent 70%)",
              }}
            />
            {/* 중앙 아이콘 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                <IconComponent className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
            </div>
            {/* 아티스트명 표시 */}
            {post.artist && (
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-white/90 text-sm font-bold drop-shadow-md">
                  {post.artist.name}
                </span>
              </div>
            )}
          </div>
        )}
        {/* 하단 그라데이션 오버레이 */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        {/* 카테고리 뱃지 - 그라디언트 */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold text-white shadow-lg bg-gradient-to-r ${config.badgeGradient}`}
          >
            {config.label}
          </span>
        </div>
        {/* AI 점수 뱃지 */}
        {aiScore > 0 && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-lg text-xs font-bold bg-black/50 text-white backdrop-blur-sm flex items-center gap-1">
              <Sparkle className="w-3 h-3" />
              {aiScore}
            </span>
          </div>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="p-4">
        {/* 아티스트 */}
        {post.artist && (
          <p className={`text-xs font-semibold mb-1 tracking-wide uppercase ${config.accentColor}`}>
            {post.artist.name}
          </p>
        )}

        {/* 제목 */}
        <h3 className="font-bold mb-1.5 line-clamp-2 text-gray-900 dark:text-white leading-snug group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200">
          {post.title}
        </h3>

        {/* 설명 */}
        {post.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
            {post.description}
          </p>
        )}

        {/* 작성자 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-gray-900">
            {post.author.image ? (
              <Image
                src={post.author.image}
                alt=""
                width={24}
                height={24}
                className="object-cover"
              />
            ) : (
              <User className="w-3 h-3 text-white" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {post.author.nickname || "익명"}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">· {timeAgo}</span>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
          {/* 액션 아이콘 */}
          <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
            <button
              onClick={(e) => {
                e.preventDefault();
                onReaction(post.id, "LIKE");
              }}
              className={`flex items-center gap-1 transition-all duration-200 ${
                post.myReactions.includes("LIKE")
                  ? "text-red-500 scale-110"
                  : "hover:text-red-500 hover:scale-110"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  post.myReactions.includes("LIKE") ? "fill-current" : ""
                }`}
              />
              <span className="text-xs font-medium">{likeCount}</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                onReaction(post.id, "CHEER");
              }}
              className={`flex items-center gap-1 transition-all duration-200 ${
                post.myReactions.includes("CHEER")
                  ? "text-blue-500 scale-110"
                  : "hover:text-blue-500 hover:scale-110"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span className="text-xs font-medium">{cheerCount}</span>
            </button>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-medium">{post.commentCount}</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-medium">{post.viewCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
