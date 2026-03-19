"use client";

import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Eye,
  Megaphone,
  Sparkle,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const CATEGORY_STYLES: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  REMIX: { label: "리믹스", bg: "bg-purple-500", text: "text-purple-600 dark:text-purple-400" },
  VIRTUAL: { label: "버추얼", bg: "bg-pink-500", text: "text-pink-600 dark:text-pink-400" },
  CONCEPT: { label: "컨셉", bg: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
  PERFORMANCE: { label: "퍼포먼스", bg: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" },
  IDOL_PROJECT: { label: "아이돌 프로젝트", bg: "bg-green-500", text: "text-green-600 dark:text-green-400" },
  GLOBAL_SYNC: { label: "글로벌 싱크", bg: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400" },
};

const CATEGORY_EMOJI: Record<string, string> = {
  REMIX: "🎵",
  VIRTUAL: "🎭",
  CONCEPT: "🎨",
  PERFORMANCE: "💃",
  IDOL_PROJECT: "⭐",
  GLOBAL_SYNC: "🌍",
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
  };
  onReaction: (postId: string, type: string) => void;
}

export default function PostCard({ post, onReaction }: PostCardProps) {
  const cat = CATEGORY_STYLES[post.category] || {
    label: post.category,
    bg: "bg-gray-500",
    text: "text-gray-500",
  };
  const emoji = CATEGORY_EMOJI[post.category] || "🎵";
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const likeCount = post.reactionCount;
  const cheerCount = post.cheerCount ?? Math.floor(post.reactionCount * 0.7);
  const aiScore = post.aiScore ?? Math.floor(post.reactionCount * 0.3);

  return (
    <Link
      href={`/post/${post.id}`}
      className="block bg-gray-50 dark:bg-[#0f0f0f] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg dark:hover:shadow-none transition-all"
    >
      {/* 썸네일 */}
      <div className="aspect-video relative overflow-hidden">
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${
              post.gradient || "from-purple-900/20 to-pink-900/20"
            } flex items-center justify-center`}
          >
            <span className="text-5xl drop-shadow-lg">{emoji}</span>
          </div>
        )}
        {/* 카테고리 오버레이 뱃지 */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${cat.bg} text-white shadow-md`}
          >
            {cat.label}
          </span>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="p-4">
        {/* 아티스트 */}
        {post.artist && (
          <p className="text-xs text-black font-medium mb-1">
            {post.artist.name}
          </p>
        )}

        {/* 제목 */}
        <h3 className="font-semibold mb-1.5 line-clamp-2 text-gray-900 dark:text-white">
          {post.title}
        </h3>

        {/* 설명 */}
        {post.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {post.description}
          </p>
        )}

        {/* 작성자 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
            {post.author.image ? (
              <img
                src={post.author.image}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-3 h-3 text-white" />
            )}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {post.author.nickname || "익명"}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">· {timeAgo}</span>
        </div>

        {/* 액션 아이콘 */}
        <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
          <button
            onClick={(e) => {
              e.preventDefault();
              onReaction(post.id, "LIKE");
            }}
            className={`flex items-center gap-1 transition-colors ${
              post.myReactions.includes("LIKE")
                ? "text-red-500"
                : "hover:text-red-500"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                post.myReactions.includes("LIKE") ? "fill-current" : ""
              }`}
            />
            <span>{likeCount}</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onReaction(post.id, "CHEER");
            }}
            className={`flex items-center gap-1 transition-colors ${
              post.myReactions.includes("CHEER")
                ? "text-blue-500"
                : "hover:text-blue-500"
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>{cheerCount}</span>
          </button>
          <div className="flex items-center gap-1">
            <Sparkle className="w-4 h-4" />
            <span>{aiScore}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentCount}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Eye className="w-4 h-4" />
            <span>{post.viewCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
