"use client";

import { UserRound, User, Users } from "lucide-react";

const GENDERS = [
  { value: "female", label: "여성", icon: UserRound, desc: "여성형 캐릭터" },
  { value: "male", label: "남성", icon: User, desc: "남성형 캐릭터" },
  { value: "neutral", label: "중성", icon: Users, desc: "중성적 캐릭터" },
];

const CONCEPTS = [
  { value: "idol", label: "아이돌" },
  { value: "pure", label: "청순" },
  { value: "powerful", label: "파워풀" },
  { value: "dark", label: "다크" },
  { value: "fantasy", label: "판타지" },
  { value: "retro", label: "레트로" },
  { value: "girlcrush", label: "걸크러시" },
  { value: "chic", label: "시크" },
  { value: "cute", label: "큐트" },
  { value: "boyish", label: "보이시" },
];

const PERSONALITY_TAGS = [
  "활발함", "차분함", "신비로움", "털털함", "도도함",
  "순수함", "엉뚱함", "반전매력", "리더십", "막내기질",
];

interface Props {
  idol: { name: string; gender: string; concept: string | null; personality: string | null; stylePreset: string };
  onUpdate: (data: Partial<Props["idol"]>) => void;
  onNext: () => void;
}

export default function Step1_Identity({ idol, onUpdate, onNext }: Props) {
  const selectedConcepts = idol.concept?.split(",").map((s) => s.trim()).filter(Boolean) || [];

  const toggleConcept = (value: string) => {
    let next: string[];
    if (selectedConcepts.includes(value)) {
      next = selectedConcepts.filter((c) => c !== value);
    } else if (selectedConcepts.length < 3) {
      next = [...selectedConcepts, value];
    } else {
      return;
    }
    onUpdate({ concept: next.join(", "), stylePreset: next[0] || "idol" });
  };

  const addPersonalityTag = (tag: string) => {
    const current = idol.personality || "";
    if (current.includes(tag)) return;
    onUpdate({ personality: current ? `${current}, ${tag}` : tag });
  };

  return (
    <div className="space-y-8">
      {/* 이름 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-3">아이돌 이름</h3>
        <div className="relative">
          <input
            type="text"
            value={idol.name === "미설정" || idol.name === "새 버추얼 아이돌" ? "" : idol.name}
            onChange={(e) => onUpdate({ name: e.target.value || "미설정" })}
            placeholder="예) ARIA, 루나, NOVA..."
            maxLength={20}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
            {(idol.name === "미설정" ? 0 : idol.name.length)}/20
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">이름은 나중에 변경할 수 있어요</p>
      </section>

      {/* 성별 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-3">성별</h3>
        <div className="grid grid-cols-3 gap-3">
          {GENDERS.map((g) => {
            const Icon = g.icon;
            const sel = idol.gender === g.value;
            return (
              <button key={g.value} onClick={() => onUpdate({ gender: g.value })}
                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all ${
                  sel ? "border-black bg-black text-white" : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}>
                <Icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{g.label}</span>
                <span className={`text-[10px] ${sel ? "text-gray-300" : "text-gray-400"}`}>{g.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 컨셉 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-1">컨셉</h3>
        <p className="text-[11px] text-gray-400 mb-3">최대 3개 선택</p>
        <div className="flex flex-wrap gap-2">
          {CONCEPTS.map((c) => {
            const sel = selectedConcepts.includes(c.value);
            return (
              <button key={c.value} onClick={() => toggleConcept(c.value)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  sel ? "border-black bg-black text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}>
                {c.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 성격 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-3">성격 설정</h3>
        <textarea
          value={idol.personality || ""}
          onChange={(e) => onUpdate({ personality: e.target.value })}
          placeholder="예) 무대 위에서는 카리스마 넘치지만 무대 밖에서는 수줍음 많고 따뜻한 성격..."
          maxLength={200}
          rows={3}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none transition-colors"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {PERSONALITY_TAGS.map((tag) => (
            <button key={tag} onClick={() => addPersonalityTag(tag)}
              className={`px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                (idol.personality || "").includes(tag)
                  ? "border-black bg-black text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}>
              {tag}
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={onNext}
        disabled={!idol.name || idol.name === "미설정" || idol.name === "새 버추얼 아이돌"}
        className="w-full py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-40 transition-all"
      >
        다음: 외모 설정 &rarr;
      </button>
    </div>
  );
}
