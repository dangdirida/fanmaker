"use client";

import dynamic from "next/dynamic";
import { Loader2, Check, AlertCircle } from "lucide-react";

const VRMPreviewCanvas = dynamic(() => import("./VRMPreviewCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300 mx-auto mb-2" />
        <p className="text-xs text-gray-400">3D 캐릭터 로딩 중...</p>
      </div>
    </div>
  ),
});

const STEP_LABELS = ["", "기본 정보", "외모 커스터마이즈", "목소리 & 특성", "완성 & 게시"];

const HAIR_LENGTH_LABELS: Record<string, string> = {
  short: "숏컷", bob: "단발", medium: "중단발", long: "롱",
  twintail: "트윈테일", ponytail: "포니테일", updo: "업스타일",
};
const OUTFIT_LABELS: Record<string, string> = {
  stage: "무대복", casual: "캐주얼", uniform: "교복",
  training: "훈련복", fantasy: "판타지", street: "스트릿", hanbok: "한복",
};

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
  const progressPct = (idol.step / 4) * 100;

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

      {/* 3D 캐릭터 프리뷰 카드 */}
      <div className="aspect-[3/4] rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-3 left-0 right-0 flex justify-center z-10">
          <span className="px-3 py-0.5 rounded-full bg-black/5 text-gray-400 text-[9px] font-medium tracking-widest uppercase">
            Virtual Idol
          </span>
        </div>

        <div className="w-full h-full">
          <VRMPreviewCanvas
            hairColor={idol.hairColor}
            skinTone={idol.skinTone}
            eyeColor={idol.eyeColor}
            gender={idol.gender}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 to-transparent px-4 pt-6 pb-3">
          <h3 className="text-gray-900 text-base font-bold truncate text-center">
            {!idol.name || idol.name === "미설정"
              ? <span className="text-gray-300 font-normal text-sm">이름을 입력해주세요</span>
              : idol.name}
          </h3>
          {idol.concept && (
            <div className="flex flex-wrap gap-1 justify-center mt-1">
              {idol.concept.split(",").map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">
                  {c.trim()}
                </span>
              ))}
            </div>
          )}
          {idol.positions.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mt-1">
              {idol.positions.slice(0, 2).map((p) => (
                <span key={p} className="px-1.5 py-0.5 rounded bg-gray-50 text-gray-400 text-[9px] border border-gray-100">
                  {p}
                </span>
              ))}
            </div>
          )}
          {/* 외모 옵션 표시 */}
          <div className="flex flex-wrap gap-1 justify-center mt-1.5">
            {idol.hairLength && (
              <span className="px-1.5 py-0.5 rounded bg-gray-50 text-gray-400 text-[9px] border border-gray-100">
                {HAIR_LENGTH_LABELS[idol.hairLength] || idol.hairLength}
              </span>
            )}
            {idol.hairColor && (
              <span className="px-1.5 py-0.5 rounded bg-gray-50 text-gray-400 text-[9px] border border-gray-100 flex items-center gap-0.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: idol.hairColor }} />
                헤어
              </span>
            )}
            {idol.outfitStyle && (
              <span className="px-1.5 py-0.5 rounded bg-gray-50 text-gray-400 text-[9px] border border-gray-100">
                {OUTFIT_LABELS[idol.outfitStyle] || idol.outfitStyle}
              </span>
            )}
            {idol.accessories?.slice(0, 2).map((a) => (
              <span key={a} className="px-1.5 py-0.5 rounded bg-gray-50 text-gray-400 text-[9px] border border-gray-100">
                {a}
              </span>
            ))}
          </div>
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
