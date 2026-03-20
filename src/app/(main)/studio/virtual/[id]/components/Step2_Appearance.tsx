"use client";

import { Check } from "lucide-react";

const HAIR_LENGTHS = [
  { value: "short", label: "숏컷" }, { value: "bob", label: "단발" },
  { value: "medium", label: "중단발" }, { value: "long", label: "롱" },
  { value: "twintail", label: "트윈테일" }, { value: "ponytail", label: "포니테일" },
  { value: "updo", label: "업스타일" },
];

const HAIR_COLORS = [
  { value: "#1a1a1a", label: "블랙" }, { value: "#8B5E3C", label: "브라운" },
  { value: "#E8C872", label: "금발" }, { value: "#F28DA0", label: "핑크" },
  { value: "#5B9BD5", label: "파랑" }, { value: "#9B72CF", label: "보라" },
  { value: "#D94F4F", label: "레드" }, { value: "#E8E8E8", label: "화이트" },
  { value: "#4CAF50", label: "그린" }, { value: "#FF9800", label: "오렌지" },
];

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

const OUTFIT_STYLES = [
  { value: "stage", label: "아이돌 무대복" }, { value: "casual", label: "캐주얼" },
  { value: "uniform", label: "교복" }, { value: "training", label: "훈련복" },
  { value: "fantasy", label: "판타지 드레스" }, { value: "street", label: "스트릿" },
  { value: "hanbok", label: "한복 퓨전" },
];

const ACCESSORIES = [
  "귀걸이", "목걸이", "헤어핀", "안경", "리본", "왕관", "마스크", "고양이귀", "날개",
];

interface IdolAppearance {
  hairColor: string;
  hairLength: string;
  skinTone: string;
  eyeColor: string;
  outfitStyle: string;
  accessories: string[];
}

interface Props {
  idol: IdolAppearance;
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
        const isLight = ["#E8E8E8", "#E8C872", "#FAD7C0", "#F5C5A3"].includes(val);
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

export default function Step2_Appearance({ idol, onUpdate, onPrev, onNext }: Props) {
  const toggleAccessory = (acc: string) => {
    const next = idol.accessories.includes(acc)
      ? idol.accessories.filter((a) => a !== acc)
      : [...idol.accessories, acc];
    onUpdate({ accessories: next });
  };

  return (
    <div className="space-y-8">
      {/* 헤어 길이 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-1">헤어 길이</h3>
        <p className="text-[11px] text-amber-500 mb-3">헤어 컬러만 3D 프리뷰에 반영됩니다</p>
        <div className="flex flex-wrap gap-2">
          {HAIR_LENGTHS.map((h) => (
            <button key={h.value} onClick={() => onUpdate({ hairLength: h.value })}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                idol.hairLength === h.value ? "border-black bg-black text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}>
              {h.label}
            </button>
          ))}
        </div>
      </section>

      {/* 헤어 컬러 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-2">헤어 컬러</h3>
        <ColorSwatch
          colors={HAIR_COLORS.map((h) => ({ value: h.value, label: h.label }))}
          selected={idol.hairColor}
          onSelect={(v) => onUpdate({ hairColor: v })}
        />
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] text-gray-400">커스텀:</span>
          <input type="color" value={idol.hairColor}
            onChange={(e) => onUpdate({ hairColor: e.target.value })}
            className="w-7 h-7 rounded-full border-0 cursor-pointer" />
        </div>
      </section>

      {/* 피부톤 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-2">피부톤</h3>
        <ColorSwatch
          colors={SKIN_TONES.map((s) => ({ value: s.color, label: s.label }))}
          selected={idol.skinTone}
          onSelect={(v) => onUpdate({ skinTone: v })}
          size="w-10 h-10"
        />
      </section>

      {/* 눈 색상 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-2">눈 색상</h3>
        <ColorSwatch
          colors={EYE_COLORS.map((e) => ({ value: e.value, label: e.label }))}
          selected={idol.eyeColor}
          onSelect={(v) => onUpdate({ eyeColor: v })}
        />
      </section>

      {/* 의상 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-1">의상 스타일</h3>
        <p className="text-[11px] text-amber-500 mb-3">3D 프리뷰에 반영되지 않습니다</p>
        <div className="flex flex-wrap gap-2">
          {OUTFIT_STYLES.map((o) => (
            <button key={o.value} onClick={() => onUpdate({ outfitStyle: o.value })}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                idol.outfitStyle === o.value ? "border-black bg-black text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}>
              {o.label}
            </button>
          ))}
        </div>
      </section>

      {/* 악세서리 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-3">악세서리</h3>
        <div className="flex flex-wrap gap-2">
          {ACCESSORIES.map((a) => (
            <button key={a} onClick={() => toggleAccessory(a)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                idol.accessories.includes(a) ? "border-black bg-black text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}>
              {a}
            </button>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <button onClick={onPrev} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          &larr; 이전
        </button>
        <button onClick={onNext} className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
          다음: 목소리 설정 &rarr;
        </button>
      </div>
    </div>
  );
}
