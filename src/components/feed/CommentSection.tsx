"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Send, Trash2, CornerDownRight } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; nickname: string | null; image: string | null };
  replies: Comment[];
}

export default function CommentSection({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/posts/${postId}/comments`);
    const data = await res.json();
    if (data.success) setComments(data.data);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (parentId?: string) => {
    const text = parentId ? replyContent : content;
    if (!text.trim()) return;

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, parentId }),
    });

    if (res.ok) {
      if (parentId) {
        setReplyContent("");
        setReplyTo(null);
      } else {
        setContent("");
      }
      fetchComments();
    }
  };

  const handleDelete = async (commentId: string) => {
    const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    });
    if (res.ok) fetchComments();
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? "ml-8 mt-2" : "mt-3"}`}>
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
          {comment.author.image && (
            <Image src={comment.author.image} alt="" width={28} height={28} className="w-full h-full object-cover" unoptimized />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white">
              {comment.author.nickname || "익명"}
            </span>
            <span className="text-[10px] text-gray-600">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}
            </span>
          </div>
          <p className="text-sm text-gray-300 mt-0.5 break-words">{comment.content}</p>
          <div className="flex items-center gap-3 mt-1">
            {!isReply && session?.user && (
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="text-[10px] text-gray-500 hover:text-gray-300 flex items-center gap-1"
              >
                <CornerDownRight className="w-3 h-3" />
                답글
              </button>
            )}
            {session?.user?.id === comment.author.id && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="text-[10px] text-gray-500 hover:text-red-400 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                삭제
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 대댓글 입력 */}
      {replyTo === comment.id && session?.user && (
        <div className="ml-9 mt-2 flex gap-2">
          <input
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit(comment.id)}
            placeholder="답글 입력..."
            className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-black"
          />
          <button
            onClick={() => handleSubmit(comment.id)}
            className="text-black hover:text-[#1f2937]"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 대댓글 목록 */}
      {comment.replies?.map((reply) => renderComment(reply, true))}
    </div>
  );

  return (
    <div>
      <h3 className="text-sm font-medium text-white mb-3">
        댓글 {comments.length}개
      </h3>

      {/* 댓글 입력 */}
      {session?.user ? (
        <div className="flex gap-2 mb-4">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="댓글을 남겨보세요..."
            className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-black"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!content.trim()}
            className="px-3 py-2 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          로그인 후 댓글을 남길 수 있어요
        </p>
      )}

      {/* 댓글 목록 */}
      {loading ? (
        <div className="text-center text-gray-500 py-4">로딩 중...</div>
      ) : comments.length === 0 ? (
        <div className="text-center text-gray-600 py-8">
          첫 댓글을 남겨보세요
        </div>
      ) : (
        <div className="space-y-1">{comments.map((c) => renderComment(c))}</div>
      )}
    </div>
  );
}
