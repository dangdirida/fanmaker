"use client";

import { Loader2, Check, AlertCircle } from "lucide-react";
import CharacterSilhouette from "./CharacterSilhouette";

const STYLE_GRADIENTS: Record<string, string> = {
  idol: "from-violet-500 to-fuchsia-500",
  pure: "from-sky-300 to-blue-400",
  powerful: "from-red-500 to-orange-500",
  dark: "from-gray-800 to-gray-900",
  fantasy: "from-purple-400 to-pink-400",
  retro: "from-amber-400 to-yellow-500",
  girlcrush: "from-rose-500 to-red-600",
  chic: "from-gray-600 to-gray-700",
  cute: "from-pink-300 to-rose-400",
  boyish: "from-blue-500 to-cyan-500",
};

const STEP_LABELS = ["", "기본 정보", "외모 커스터마이즈", "목소리 & 특성", "완성 & 게시"];

interface IdolData {
  name: string;
  concept: string | null;
  gender: string;
  stylePreset: string;
  hairColor: string;
  hairLength: string;
  skinTone: string;
  eyeColor: string;
  outfitStyle: string;
  accessories: string[];
  voiceType: string;
  positions: string[];
  step: number;
}

interface Props {
  idol: IdolData;
  saving: "idle" | "saving" | "saved" | "error";
}

export default function LivePreviewPanel({ idol, saving }: Props) {
  const grad = STYLE_GRADIENTS[idol.stylePreset] || STYLE_GRADIENTS.idol;
  const progressPct = ((idol.step) / 4) * 100;

  return (
    <div className="lg:sticky lg:top-24 space-y-4">
      {/* 저장 상태 */}
      <div className="flex items-center gap-2 text-xs h-5">
        {saving === "saving" && (
          <><Loader2 className="w-3 h-3 animate-spin text-gray-400" /><span className="text-gray-400">자동저장 중...</span></>
        )}
        {saving === "saved" && (
          <><Check className="w-3 h-3 text-green-500" /><span className="text-green-600">저장됨</span></>
        )}
        {saving === "error" && (
          <><AlertCircle className="w-3 h-3 text-red-500" /><span className="text-red-500">저장 실패</span></>
        )}
      </div>

      {/* 캐릭터 프리뷰 카드 */}
      <div className={`aspect-[3/4] rounded-2xl bg-gradient-to-br ${grad} p-6 flex flex-col items-center justify-between overflow-hidden relative`}>
        <div className="w-full text-center">
          <p className="text-white/60 text-[10px] font-medium tracking-widest uppercase">
            Virtual Idol
          </p>
        </div>

        <div className="w-40 h-52 flex-shrink-0">
          <CharacterSilhouette
            hairColor={idol.hairColor}
            hairLength={idol.hairLength}
            skinTone={idol.skinTone}
            eyeColor={idol.eyeColor}
            outfitStyle={idol.outfitStyle}
            accessories={idol.accessories}
            gender={idol.gender}
          />
        </div>

        <div className="text-center w-full">
          <h3 className="text-white text-lg font-bold truncate">
            {idol.name === "미설정" || !idol.name ? (
              <span className="text-white/40">이름을 입력해주세요</span>
            ) : idol.name}
          </h3>
          {idol.concept && (
            <div className="flex flex-wrap gap-1 justify-center mt-1.5">
              {idol.concept.split(",").map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-white/15 text-white/80 text-[10px]">
                  {c.trim()}
                </span>
              ))}
            </div>
          )}
          {idol.positions.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mt-1">
              {idol.positions.slice(0, 3).map((p) => (
                <span key={p} className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-[9px]">
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Step 진행 */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Step {idol.step}/4 - {STEP_LABELS[idol.step]}</span>
          <span className="text-gray-400">{Math.round(progressPct)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
    </div>
  );
}
