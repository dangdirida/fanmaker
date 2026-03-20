"use client";

import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";

const VOICE_TYPES = [
  { value: "clear", label: "맑고 청량한", desc: "소프라노형 아이돌", pitch: 1.3, rate: 1.0 },
  { value: "powerful", label: "파워풀 & 강렬한", desc: "메인보컬", pitch: 0.8, rate: 1.1 },
  { value: "husky", label: "낮고 허스키한", desc: "시크한 분위기", pitch: 0.7, rate: 0.9 },
  { value: "cute", label: "앙칼지고 귀여운", desc: "큐트 컨셉", pitch: 1.8, rate: 1.2 },
  { value: "neutral", label: "중성적이고 신비로운", desc: "판타지 컨셉", pitch: 1.0, rate: 0.9 },
  { value: "warm", label: "부드럽고 따뜻한", desc: "발라드형", pitch: 1.0, rate: 0.85 },
];

const POSITIONS = [
  "메인보컬", "리드보컬", "서브보컬", "메인댄서", "리드댄서",
  "서브댄서", "래퍼", "메인래퍼", "센터", "비주얼", "리더", "막내",
];

const GENRES = ["K-pop", "발라드", "R&B", "힙합", "EDM", "팝", "인디", "재즈"];

interface IdolVoice {
  name: string;
  voiceType: string;
  voiceDesc: string | null;
  positions: string[];
  genres: string[];
}

interface Props {
  idol: IdolVoice;
  onUpdate: (data: Partial<IdolVoice>) => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Step3_Voice({ idol, onUpdate, onPrev, onNext }: Props) {
  const [speaking, setSpeaking] = useState(false);

  const handlePreview = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const vt = VOICE_TYPES.find((v) => v.value === idol.voiceType) || VOICE_TYPES[0];
    const name = idol.name === "미설정" ? "버추얼 아이돌" : idol.name;
    const utter = new SpeechSynthesisUtterance(
      `안녕하세요! 저는 ${name}이에요. 잘 부탁드려요!`
    );
    utter.lang = "ko-KR";
    utter.pitch = vt.pitch;
    utter.rate = vt.rate;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const togglePosition = (p: string) => {
    const next = idol.positions.includes(p)
      ? idol.positions.filter((x) => x !== p)
      : [...idol.positions, p];
    onUpdate({ positions: next });
  };

  const toggleGenre = (g: string) => {
    const next = idol.genres.includes(g)
      ? idol.genres.filter((x) => x !== g)
      : [...idol.genres, g];
    onUpdate({ genres: next });
  };

  return (
    <div className="space-y-8">
      {/* 목소리 타입 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-3">목소리 타입</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {VOICE_TYPES.map((v) => {
            const sel = idol.voiceType === v.value;
            return (
              <button key={v.value} onClick={() => onUpdate({ voiceType: v.value })}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  sel ? "border-black bg-black text-white" : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}>
                <p className="text-sm font-bold">{v.label}</p>
                <p className={`text-[11px] mt-0.5 ${sel ? "text-gray-300" : "text-gray-400"}`}>{v.desc}</p>
              </button>
            );
          })}
        </div>

        <button onClick={handlePreview} disabled={speaking}
          className="flex items-center gap-2 mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-200 disabled:opacity-50 transition-all">
          {speaking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
          미리 듣기
        </button>
      </section>

      {/* 목소리 특징 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-3">목소리 특징</h3>
        <textarea
          value={idol.voiceDesc || ""}
          onChange={(e) => onUpdate({ voiceDesc: e.target.value })}
          placeholder="예) 고음 폭발력이 뛰어나고 감정 표현이 풍부함..."
          maxLength={150}
          rows={2}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none transition-colors"
        />
      </section>

      {/* 포지션 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-3">포지션</h3>
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((p) => (
            <button key={p} onClick={() => togglePosition(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                idol.positions.includes(p) ? "border-black bg-black text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}>
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* 장르 */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-3">대표 장르</h3>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button key={g} onClick={() => toggleGenre(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                idol.genres.includes(g) ? "border-black bg-black text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}>
              {g}
            </button>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <button onClick={onPrev} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          &larr; 이전
        </button>
        <button onClick={onNext} className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
          다음: 완성 &rarr;
        </button>
      </div>
    </div>
  );
}
