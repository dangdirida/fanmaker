"use client";

import Link from "next/link";
import { Heart, MessageCircle, Eye, Megaphone, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const CATEGORY_STYLES: Record<string, { label: string; color: string }> = {
  REMIX: { label: "리믹스", color: "bg-purple-500/20 text-purple-400" },
  VIRTUAL: { label: "버추얼", color: "bg-pink-500/20 text-pink-400" },
  CONCEPT: { label: "컨셉", color: "bg-cyan-500/20 text-cyan-400" },
  PERFORMANCE: { label: "퍼포먼스", color: "bg-orange-500/20 text-orange-400" },
  IDOL_PROJECT: { label: "아이돌 프로젝트", color: "bg-green-500/20 text-green-400" },
  GLOBAL_SYNC: { label: "글로벌 싱크", color: "bg-amber-500/20 text-amber-400" },
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
  };
  onReaction: (postId: string, type: string) => void;
}

export default function PostCard({ post, onReaction }: PostCardProps) {
  const cat = CATEGORY_STYLES[post.category] || { label: post.category, color: "bg-gray-500/20 text-gray-400" };
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
      {/* 썸네일 */}
      <Link href={`/post/${post.id}`}>
        <div className="relative h-40 bg-gray-900 flex items-center justify-center">
          {post.thumbnailUrl ? (
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-700 text-4xl">
              {post.category === "REMIX" && "🎵"}
              {post.category === "VIRTUAL" && "🎭"}
              {post.category === "CONCEPT" && "🎨"}
              {post.category === "PERFORMANCE" && "💃"}
              {post.category === "IDOL_PROJECT" && "⭐"}
              {post.category === "GLOBAL_SYNC" && "🌍"}
            </div>
          )}
          <span className={`absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full ${cat.color}`}>
            {cat.label}
          </span>
        </div>
      </Link>

      <div className="p-3">
        {/* 제목 */}
        <Link href={`/post/${post.id}`}>
          <h3 className="text-sm font-medium text-white truncate hover:text-[#ff3d7f] transition-colors">
            {post.title}
          </h3>
        </Link>

        {/* 작성자 */}
        <div className="flex items-center gap-2 mt-2">
          <div className="w-5 h-5 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
            {post.author.image ? (
              <img src={post.author.image} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <span className="text-xs text-gray-400 truncate">
            {post.author.nickname || "익명"}
          </span>
          <span className="text-xs text-gray-600">{timeAgo}</span>
        </div>

        {/* 아티스트 태그 */}
        {post.artist && (
          <Link
            href={`/artist/${post.artist.id}`}
            className="inline-block mt-1.5 text-[10px] text-[#ff3d7f] bg-[#ff3d7f]/10 px-2 py-0.5 rounded-full hover:bg-[#ff3d7f]/20 transition-colors"
          >
            {post.artist.name}
          </Link>
        )}

        {/* 반응 버튼 */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onReaction(post.id, "LIKE")}
              className={`flex items-center gap-1 text-xs transition-colors ${
                post.myReactions.includes("LIKE")
                  ? "text-red-400"
                  : "text-gray-500 hover:text-red-400"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${post.myReactions.includes("LIKE") ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => onReaction(post.id, "CHEER")}
              className={`flex items-center gap-1 text-xs transition-colors ${
                post.myReactions.includes("CHEER")
                  ? "text-blue-400"
                  : "text-gray-500 hover:text-blue-400"
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onReaction(post.id, "WOW")}
              className={`flex items-center gap-1 text-xs transition-colors ${
                post.myReactions.includes("WOW")
                  ? "text-yellow-400"
                  : "text-gray-500 hover:text-yellow-400"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-gray-600">{post.reactionCount}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <span className="flex items-center gap-1 text-[10px]">
              <MessageCircle className="w-3 h-3" />
              {post.commentCount}
            </span>
            <span className="flex items-center gap-1 text-[10px]">
              <Eye className="w-3 h-3" />
              {post.viewCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
