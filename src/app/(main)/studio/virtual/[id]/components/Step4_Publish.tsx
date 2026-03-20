"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Save, Loader2 } from "lucide-react";
import CharacterSilhouette from "./CharacterSilhouette";

const STYLE_GRADIENTS: Record<string, string> = {
  idol: "from-violet-500 to-fuchsia-500", pure: "from-sky-300 to-blue-400",
  powerful: "from-red-500 to-orange-500", dark: "from-gray-800 to-gray-900",
  fantasy: "from-purple-400 to-pink-400", retro: "from-amber-400 to-yellow-500",
  girlcrush: "from-rose-500 to-red-600", chic: "from-gray-600 to-gray-700",
  cute: "from-pink-300 to-rose-400", boyish: "from-blue-500 to-cyan-500",
};

interface IdolFull {
  id: string;
  name: string;
  concept: string | null;
  personality: string | null;
  voiceType: string;
  positions: string[];
  genres: string[];
  gender: string;
  stylePreset: string;
  hairColor: string;
  hairLength: string;
  skinTone: string;
  eyeColor: string;
  outfitStyle: string;
  accessories: string[];
}

interface Props {
  idol: IdolFull;
  onPrev: () => void;
}

export default function Step4_Publish({ idol, onPrev }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(`${idol.name}의 버추얼 아이돌`);
  const [description, setDescription] = useState(
    [idol.personality, idol.positions.join(", ")].filter(Boolean).join(" | ")
  );
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);

  const grad = STYLE_GRADIENTS[idol.stylePreset] || STYLE_GRADIENTS.idol;

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/virtual-idols/${idol.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (data.success) router.push(`/post/${data.data.postId}`);
    } catch {
      alert("게시에 실패했습니다");
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    await fetch(`/api/virtual-idols/${idol.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDraft: true }),
    });
    setSaving(false);
    router.push("/studio/virtual");
  };

  return (
    <div className="space-y-6">
      {/* 완성 캐릭터 요약 카드 */}
      <div className={`rounded-2xl bg-gradient-to-br ${grad} p-6 flex flex-col sm:flex-row items-center gap-6`}>
        <div className="w-28 h-36 flex-shrink-0">
          <CharacterSilhouette
            hairColor={idol.hairColor} hairLength={idol.hairLength}
            skinTone={idol.skinTone} eyeColor={idol.eyeColor}
            outfitStyle={idol.outfitStyle} accessories={idol.accessories}
            gender={idol.gender} stylePreset={idol.stylePreset}
          />
        </div>
        <div className="text-white text-center sm:text-left">
          <h2 className="text-2xl font-extrabold">{idol.name}</h2>
          {idol.concept && (
            <div className="flex flex-wrap gap-1.5 mt-2 justify-center sm:justify-start">
              {idol.concept.split(",").map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-white/20 text-xs">{c.trim()}</span>
              ))}
            </div>
          )}
          {idol.personality && (
            <p className="text-white/70 text-sm mt-2 line-clamp-2">{idol.personality}</p>
          )}
          <div className="flex flex-wrap gap-1 mt-2 justify-center sm:justify-start">
            <span className="px-2 py-0.5 rounded bg-white/15 text-[10px]">{idol.voiceType}</span>
            {idol.positions.slice(0, 3).map((p) => (
              <span key={p} className="px-2 py-0.5 rounded bg-white/15 text-[10px]">{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 게시 설정 */}
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

      <p className="text-xs text-gray-400 text-center">피드에 게시하면 다른 팬들이 볼 수 있어요</p>

      <div className="flex gap-3">
        <button onClick={onPrev} className="py-3 px-5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          &larr; 이전
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
