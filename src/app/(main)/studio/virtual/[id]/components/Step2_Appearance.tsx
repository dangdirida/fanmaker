"use client";

import { Check } from "lucide-react";

const SKIN_TONES = [
  { color: "#FFF0E6", label: "밝은 피치" }, { color: "#FDDBB4", label: "살구" },
  { color: "#D4A574", label: "황금빛" }, { color: "#C18E60", label: "카라멜" },
  { color: "#8D5E3C", label: "갈색" }, { color: "#5C3A21", label: "진한 갈색" },
];

const EYE_COLORS = [
  { value: "#4a3728", label: "브라운" }, { value: "#1a1a1a", label: "블랙" },
  { value: "#3B82F6", label: "블루" }, { value: "#22C55E", label: "그린" },
  { value: "#8B5CF6", label: "퍼플" }, { value: "#E11D48", label: "레드" },
];

const OUTFIT_STYLES_FEMALE = [
  { value: "casual", label: "기본" },
  { value: "cute", label: "큐트 걸" },
  { value: "dress", label: "무대 드레스" },
  { value: "flower", label: "플라워 로맨틱" },
  { value: "white", label: "화이트 무대" },
];

const OUTFIT_STYLES_MALE = [
  { value: "casual", label: "기본" },
  { value: "cute", label: "큐트 보이" },
  { value: "dress", label: "무대 정장" },
  { value: "sports", label: "트레이닝" },
  { value: "white", label: "데일리" },
];

interface IdolAppearance {
  hairColor: string;
  hairLength: string;
  skinTone: string;
  eyeColor: string;
  outfitStyle: string;
  accessories: string[];
  gender?: string;
}

interface Props {
  idol: IdolAppearance;
  gender: string;
  onUpdate: (data: Partial<IdolAppearance>) => void;
  onPrev: () => void;
  onNext: () => void;
}

function ColorSwatch({ colors, selected, onSelect, size = "w-9 h-9" }: {
  colors: { value?: string; color?: string; label: string }[];
  selected: string;
  onSelect: (v: string) => void;
  size?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {colors.map((c) => {
        const val = c.value || c.color || "";
        const sel = selected === val;
        const isLight = ["#E8E8E8", "#E8C872", "#FAD7C0", "#F5C5A3", "#FFF0E6", "#FDDBB4"].includes(val);
        return (
          <button key={val} onClick={() => onSelect(val)} className="flex flex-col items-center gap-1">
            <div className={`${size} rounded-full flex items-center justify-center transition-all ${
              sel ? "ring-2 ring-black ring-offset-2 scale-110" : "hover:scale-105"
            } ${isLight ? "border border-gray-200" : ""}`} style={{ backgroundColor: val }}>
              {sel && <Check className={`w-3 h-3 ${isLight ? "text-gray-800" : "text-white"} drop-shadow`} />}
            </div>
            <span className="text-[9px] text-gray-400">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Step2_Appearance({ idol, gender, onUpdate, onPrev, onNext }: Props) {
  const outfitStyles = gender === "male" ? OUTFIT_STYLES_MALE : OUTFIT_STYLES_FEMALE;

  return (
    <div className="space-y-8">
      {/* 의상 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">의상</h3>
        <p className="text-[11px] text-green-500 mb-3">선택 시 3D 프리뷰에 바로 반영됩니다</p>
        <div className="flex flex-wrap gap-2">
          {outfitStyles.map((o) => (
            <button key={o.value} onClick={() => onUpdate({ outfitStyle: o.value })}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                idol.outfitStyle === o.value
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-gray-200 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300"
              }`}>
              {o.label}
            </button>
          ))}
        </div>
      </section>

      {/* 피부톤 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">피부톤</h3>
        <ColorSwatch
          colors={SKIN_TONES.map((s) => ({ value: s.color, label: s.label }))}
          selected={idol.skinTone}
          onSelect={(v) => onUpdate({ skinTone: v })}
          size="w-10 h-10"
        />
      </section>

      {/* 눈 색상 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">눈 색상</h3>
        <ColorSwatch
          colors={EYE_COLORS.map((e) => ({ value: e.value, label: e.label }))}
          selected={idol.eyeColor}
          onSelect={(v) => onUpdate({ eyeColor: v })}
        />
      </section>

      <div className="flex gap-3">
        <button onClick={onPrev} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          ← 이전
        </button>
        <button onClick={onNext} className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
          다음: 목소리 설정 →
        </button>
      </div>
    </div>
  );
}
