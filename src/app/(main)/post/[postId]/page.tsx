"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Megaphone,
  Sparkles,
  Eye,
  MessageCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import CommentSection from "@/components/feed/CommentSection";
import { MOCK_POSTS, type MockPost } from "@/lib/mockPosts";

function mockToPostDetail(mock: MockPost): PostDetail {
  return {
    id: mock.id,
    title: mock.title,
    description: mock.description,
    category: mock.category,
    thumbnailUrl: mock.thumbnailUrl,
    contentData: {},
    fileUrls: [],
    tags: [],
    viewCount: mock.viewCount,
    createdAt: mock.createdAt,
    author: mock.author,
    artist: mock.artist ? { ...mock.artist, nameEn: null } : null,
    _count: { reactions: mock.reactionCount, comments: mock.commentCount },
    myReactions: mock.myReactions,
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  REMIX: "리믹스",
  VIRTUAL: "버추얼",
  CONCEPT: "컨셉",
  PERFORMANCE: "퍼포먼스",
  IDOL_PROJECT: "아이돌 프로젝트",
  GLOBAL_SYNC: "글로벌 싱크",
};

type PostDetail = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  thumbnailUrl: string | null;
  contentData: Record<string, unknown>;
  fileUrls: string[];
  tags: string[];
  viewCount: number;
  createdAt: string;
  author: { id: string; nickname: string | null; image: string | null };
  artist: { id: string; name: string; nameEn: string | null } | null;
  _count: { reactions: number; comments: number };
  myReactions: string[];
};

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId.startsWith("mock-")) {
      const mockPost = MOCK_POSTS.find((p) => p.id === postId);
      if (mockPost) setPost(mockToPostDetail(mockPost));
      setLoading(false);
      return;
    }

    fetch(`/api/posts/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPost(data.data);
      })
      .finally(() => setLoading(false));
  }, [postId]);

  const handleReaction = async (type: string) => {
    if (!session?.user || !post) return;

    // mock post는 로컬에서만 토글
    if (postId.startsWith("mock-")) {
      const has = post.myReactions.includes(type);
      setPost({
        ...post,
        _count: {
          ...post._count,
          reactions: post._count.reactions + (has ? -1 : 1),
        },
        myReactions: has
          ? post.myReactions.filter((r) => r !== type)
          : [...post.myReactions, type],
      });
      return;
    }

    const res = await fetch(`/api/posts/${postId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });

    if (res.ok) {
      const data = await res.json();
      const added = data.data.action === "added";
      setPost((prev) =>
        prev
          ? {
              ...prev,
              _count: {
                ...prev._count,
                reactions: prev._count.reactions + (added ? 1 : -1),
              },
              myReactions: added
                ? [...prev.myReactions, type]
                : prev.myReactions.filter((r) => r !== type),
            }
          : prev
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-500">
        로딩 중...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-500">
        게시물을 찾을 수 없습니다
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        뒤로
      </button>

      {/* 카테고리 + 아티스트 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2.5 py-1 rounded-full bg-black/10 text-black">
          {CATEGORY_LABELS[post.category] || post.category}
        </span>
        {post.artist && (
          <Link
            href={`/artist/${post.artist.id}`}
            className="text-xs px-2.5 py-1 rounded-full bg-black/10 text-gray-700 hover:bg-[#374151]/20 transition-colors"
          >
            {post.artist.name}
          </Link>
        )}
      </div>

      {/* 제목 */}
      <h1 className="text-2xl font-bold text-white mb-3">{post.title}</h1>

      {/* 작성자 정보 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
          {post.author.image && (
            <img
              src={post.author.image}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div>
          <p className="text-sm text-white">
            {post.author.nickname || "익명"}
          </p>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt), {
              addSuffix: true,
              locale: ko,
            })}
          </p>
        </div>
      </div>

      {/* 썸네일 */}
      {post.thumbnailUrl && (
        <div className="mb-6 rounded-xl overflow-hidden">
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-full object-cover"
          />
        </div>
      )}

      {/* 설명 */}
      {post.description && (
        <p className="text-gray-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
          {post.description}
        </p>
      )}

      {/* 태그 */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 반응 바 */}
      <div className="flex items-center justify-between py-4 border-y border-gray-800 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleReaction("LIKE")}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              post.myReactions.includes("LIKE")
                ? "text-red-400"
                : "text-gray-400 hover:text-red-400"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${
                post.myReactions.includes("LIKE") ? "fill-current" : ""
              }`}
            />
            좋아요
          </button>
          <button
            onClick={() => handleReaction("CHEER")}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              post.myReactions.includes("CHEER")
                ? "text-blue-400"
                : "text-gray-400 hover:text-blue-400"
            }`}
          >
            <Megaphone className="w-5 h-5" />
            응원
          </button>
          <button
            onClick={() => handleReaction("WOW")}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              post.myReactions.includes("WOW")
                ? "text-yellow-400"
                : "text-gray-400 hover:text-yellow-400"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            놀라움
          </button>
        </div>
        <div className="flex items-center gap-4 text-gray-500 text-xs">
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {post._count.comments}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {post.viewCount}
          </span>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <CommentSection postId={postId} />
    </div>
  );
}
