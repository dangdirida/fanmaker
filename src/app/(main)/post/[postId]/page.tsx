"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Heart, Megaphone, Sparkles, Eye,
  MessageCircle, Trash2, Camera,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import CommentSection from "@/components/feed/CommentSection";
import { MOCK_POSTS, type MockPost } from "@/lib/mockPosts";
import CharacterSilhouette from "@/app/(main)/studio/virtual/[id]/components/CharacterSilhouette";

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
    virtualIdol: null,
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  REMIX: "리믹스", VIRTUAL: "버추얼", CONCEPT: "컨셉",
  PERFORMANCE: "퍼포먼스", IDOL_PROJECT: "아이돌 프로젝트", GLOBAL_SYNC: "글로벌 싱크",
};

const VOICE_LABELS: Record<string, string> = {
  clear: "맑고 청량한", powerful: "파워풀 & 강렬한", husky: "낮고 허스키한",
  cute: "앙칼지고 귀여운", neutral: "중성적이고 신비로운", warm: "부드럽고 따뜻한",
};

const OUTFIT_LABELS: Record<string, string> = {
  stage: "아이돌 무대복", casual: "캐주얼", uniform: "교복",
  training: "훈련복", fantasy: "판타지 드레스", street: "스트릿", hanbok: "한복 퓨전",
};

type VirtualIdolData = {
  id: string; name: string; hairColor: string; hairLength: string;
  skinTone: string; eyeColor: string; outfitStyle: string; accessories: string[];
  gender: string; concept: string | null; personality: string | null;
  voiceType: string; positions: string[]; genres: string[];
};

type PostDetail = {
  id: string; title: string; description: string | null;
  category: string; thumbnailUrl: string | null;
  contentData: Record<string, unknown>; fileUrls: string[]; tags: string[];
  viewCount: number; createdAt: string;
  author: { id: string; nickname: string | null; image: string | null };
  artist: { id: string; name: string; nameEn: string | null } | null;
  _count: { reactions: number; comments: number };
  myReactions: string[];
  virtualIdol: VirtualIdolData | null;
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
      .then((data) => { if (data.success) setPost(data.data); })
      .finally(() => setLoading(false));
  }, [postId]);

  const handleReaction = async (type: string) => {
    if (!session?.user || !post) return;
    if (postId.startsWith("mock-")) {
      const has = post.myReactions.includes(type);
      setPost({ ...post, _count: { ...post._count, reactions: post._count.reactions + (has ? -1 : 1) }, myReactions: has ? post.myReactions.filter(r => r !== type) : [...post.myReactions, type] });
      return;
    }
    // Optimistic UI
    const has = post.myReactions.includes(type);
    setPost(prev => prev ? { ...prev, _count: { ...prev._count, reactions: prev._count.reactions + (has ? -1 : 1) }, myReactions: has ? prev.myReactions.filter(r => r !== type) : [...prev.myReactions, type] } : prev);
    const res = await fetch(`/api/posts/${postId}/reactions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type }) });
    if (!res.ok) {
      setPost(prev => prev ? { ...prev, _count: { ...prev._count, reactions: prev._count.reactions + (has ? 1 : -1) }, myReactions: has ? [...prev.myReactions, type] : prev.myReactions.filter(r => r !== type) } : prev);
    }
  };

  const handleDelete = async () => {
    if (!session?.user || !post) return;
    if (post.author.id !== session.user.id) return;
    if (!confirm("이 게시물을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) router.push("/feed");
    else alert("삭제에 실패했습니다");
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-500">로딩 중...</div>;
  if (!post) return <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-500">게시물을 찾을 수 없습니다</div>;

  const isVirtual = post.category === "VIRTUAL" && post.virtualIdol;
  const vi = post.virtualIdol;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> 뒤로
        </button>
        {session?.user?.id === post.author.id && !postId.startsWith("mock-") && (
          <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> 삭제
          </button>
        )}
      </div>

      {/* 카테고리 + 아티스트 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
          {CATEGORY_LABELS[post.category] || post.category}
        </span>
        {post.artist && (
          <Link href={`/artist/${post.artist.id}`} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            {post.artist.name}
          </Link>
        )}
      </div>

      {/* 제목 */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{post.title}</h1>

      {/* 작성자 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
          {post.author.image && <Image src={post.author.image} alt="" width={32} height={32} className="w-full h-full object-cover" unoptimized />}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{post.author.nickname || "익명"}</p>
          <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}</p>
        </div>
      </div>

      {/* ── 버추얼 아이돌 전용 섹션 ── */}
      {isVirtual && vi && (
        <div className="mb-8 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* 캐릭터 + 정보 영역 */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* SVG 캐릭터 - 실제 만든 옵션 그대로 전달 */}
              <div className="w-48 h-64 flex-shrink-0 drop-shadow-lg">
                <CharacterSilhouette
                  hairColor={vi.hairColor}
                  hairLength={vi.hairLength}
                  skinTone={vi.skinTone}
                  eyeColor={vi.eyeColor}
                  outfitStyle={vi.outfitStyle}
                  accessories={vi.accessories}
                  gender={vi.gender}
                  stylePreset={vi.concept?.split(",")[0]?.trim() || "idol"}
                />
              </div>

              {/* 캐릭터 정보 */}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1">Virtual Idol</p>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">{vi.name}</h2>

                {vi.concept && (
                  <div className="flex flex-wrap gap-1.5 mb-3 justify-center sm:justify-start">
                    {vi.concept.split(",").map((c, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 text-xs font-medium">
                        {c.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {vi.personality && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed line-clamp-2">
                    {vi.personality}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-3">
                    <p className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">목소리</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {VOICE_LABELS[vi.voiceType] || vi.voiceType}
                    </p>
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-3">
                    <p className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">의상</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {OUTFIT_LABELS[vi.outfitStyle] || vi.outfitStyle}
                    </p>
                  </div>
                  {vi.positions.length > 0 && (
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-3 col-span-2">
                      <p className="text-gray-400 text-[10px] uppercase tracking-wide mb-1.5">포지션</p>
                      <div className="flex flex-wrap gap-1">
                        {vi.positions.slice(0, 4).map(p => (
                          <span key={p} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-medium">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {vi.genres.length > 0 && (
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-3 col-span-2">
                      <p className="text-gray-400 text-[10px] uppercase tracking-wide mb-1.5">장르</p>
                      <div className="flex flex-wrap gap-1">
                        {vi.genres.slice(0, 4).map(g => (
                          <span key={g} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-medium">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 체험 버튼 */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <Link
              href={`/studio/virtual/${vi.id}/webcam`}
              className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25 active:scale-95"
            >
              <Camera className="w-5 h-5" />
              {vi.name} 캐릭터로 직접 체험하기
            </Link>
            <p className="text-center text-xs text-gray-400 mt-2">
              카메라로 내 움직임을 캐릭터가 실시간으로 따라해요
            </p>
          </div>
        </div>
      )}

      {/* 일반 썸네일 (버추얼 아닌 경우) */}
      {!isVirtual && post.thumbnailUrl && (
        <div className="mb-6 rounded-xl overflow-hidden">
          <Image src={post.thumbnailUrl} alt={post.title} width={640} height={360} className="w-full object-cover" unoptimized />
        </div>
      )}

      {/* 설명 */}
      {post.description && (
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{post.description}</p>
      )}

      {/* 태그 */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {post.tags.map((tag, i) => (
            <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">#{tag}</span>
          ))}
        </div>
      )}

      {/* 반응 바 */}
      <div className="flex items-center justify-between py-4 border-y border-gray-200 dark:border-gray-800 mb-6">
        <div className="flex items-center gap-4">
          {[
            { type: "LIKE", icon: Heart, label: "좋아요", activeColor: "text-red-500" },
            { type: "CHEER", icon: Megaphone, label: "응원", activeColor: "text-blue-500" },
            { type: "WOW", icon: Sparkles, label: "놀라움", activeColor: "text-yellow-500" },
          ].map(({ type, icon: Icon, label, activeColor }) => (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              className={`flex items-center gap-1.5 text-sm transition-all duration-150 ${post.myReactions.includes(type) ? activeColor : "text-gray-400 hover:" + activeColor}`}
            >
              <Icon className={`w-5 h-5 ${post.myReactions.includes(type) && type === "LIKE" ? "fill-current" : ""}`} />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-gray-400 text-xs">
          <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{post._count.comments}</span>
          <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{post.viewCount}</span>
        </div>
      </div>

      {/* 댓글 */}
      <CommentSection postId={postId} />
    </div>
  );
}
