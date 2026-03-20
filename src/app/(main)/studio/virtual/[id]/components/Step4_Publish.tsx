"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Save, Loader2, Check, Camera } from "lucide-react";

const VOICE_LABELS: Record<string, string> = {
  clear: "맑고 청량한", powerful: "파워풀 & 강렬한", husky: "낮고 허스키한",
  cute: "앙칼지고 귀여운", neutral: "중성적이고 신비로운", warm: "부드럽고 따뜻한",
};
const OUTFIT_LABELS: Record<string, string> = {
  stage: "아이돌 무대복", casual: "캐주얼", uniform: "교복",
  training: "훈련복", fantasy: "판타지 드레스", street: "스트릿", hanbok: "한복 퓨전",
};

interface IdolFull {
  id: string; name: string; concept: string | null; personality: string | null;
  voiceType: string; positions: string[]; genres: string[]; gender: string;
  stylePreset: string; hairColor: string; hairLength: string; skinTone: string;
  eyeColor: string; outfitStyle: string; accessories: string[];
}
interface Props { idol: IdolFull; onPrev: () => void; }

export default function Step4_Publish({ idol, onPrev }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(`${idol.name}의 버추얼 아이돌`);
  const [description, setDescription] = useState(
    [idol.personality, idol.positions.join(", ")].filter(Boolean).join(" | ")
  );
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/virtual-idols/${idol.id}/publish`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (data.success) router.push(`/post/${data.data.postId}`);
    } catch { alert("게시에 실패했습니다"); }
    finally { setPublishing(false); }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    await fetch(`/api/virtual-idols/${idol.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDraft: true }),
    });
    setSaving(false);
    router.push("/studio/virtual");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">완성</span>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">{idol.name}</h2>
          {idol.concept && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {idol.concept.split(",").map((c, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full bg-black text-white text-xs font-medium">{c.trim()}</span>
              ))}
            </div>
          )}
          {idol.personality && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{idol.personality}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">목소리</p>
            <p className="text-sm text-gray-700 font-medium">{VOICE_LABELS[idol.voiceType] || idol.voiceType}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">의상</p>
            <p className="text-sm text-gray-700 font-medium">{OUTFIT_LABELS[idol.outfitStyle] || idol.outfitStyle}</p>
          </div>
          {idol.positions.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">포지션</p>
              <div className="flex flex-wrap gap-1">
                {idol.positions.slice(0, 3).map((p) => (
                  <span key={p} className="px-2 py-0.5 rounded-lg bg-gray-200 text-gray-700 text-xs">{p}</span>
                ))}
              </div>
            </div>
          )}
          {idol.genres.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">장르</p>
              <div className="flex flex-wrap gap-1">
                {idol.genres.slice(0, 3).map((g) => (
                  <span key={g} className="px-2 py-0.5 rounded-lg bg-gray-200 text-gray-700 text-xs">{g}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="pt-3 border-t border-gray-200 space-y-1.5">
          {[
            { label: "이름 설정", done: !!idol.name && idol.name !== "미설정" && idol.name !== "새 버추얼 아이돌" },
            { label: "외모 커스터마이즈", done: !!idol.hairColor },
            { label: "목소리 설정", done: !!idol.voiceType },
            { label: "포지션 선택", done: idol.positions.length > 0 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? "bg-green-500" : "bg-gray-200"}`}>
                {item.done && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className={`text-xs ${item.done ? "text-gray-700" : "text-gray-400"}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900">게시 설정</h3>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">제목</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">설명</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none transition-colors" />
        </div>
      </section>

      <Link
        href={`/studio/virtual/${idol.id}/webcam`}
        className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all"
      >
        <Camera className="w-4 h-4" />
        내 버추얼 아이돌 직접 체험하기
      </Link>

      <p className="text-xs text-gray-400 text-center">피드에 게시하면 다른 팬들이 볼 수 있어요</p>

      <div className="flex gap-3">
        <button onClick={onPrev} className="py-3 px-5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          ← 이전
        </button>
        <button onClick={handleSaveDraft} disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-black text-black rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          임시저장
        </button>
        <button onClick={handlePublish} disabled={publishing || !title.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-all">
          {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          피드에 게시
        </button>
      </div>
    </div>
  );
}
