"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  User,
  UserRound,
  Users,
  Sparkles,
  Flower2,
  Zap,
  Moon,
  Crown,
  Music,
  Wand2,
  Loader2,
  RefreshCw,
  Send,
  Check,
} from "lucide-react";
import ArtistSelector from "@/components/common/ArtistSelector";
import PublishModal from "@/components/studio/PublishModal";

type Artist = {
  id: string;
  name: string;
  nameEn: string | null;
  groupImageUrl: string | null;
};

const GENDERS = [
  {
    value: "female",
    label: "여성",
    icon: UserRound,
    desc: "여성형 캐릭터",
  },
  { value: "male", label: "남성", icon: User, desc: "남성형 캐릭터" },
  { value: "neutral", label: "중성", icon: Users, desc: "중성적 캐릭터" },
];

const SKIN_TONES = [
  { color: "#FAD7C0", label: "밝은 살구" },
  { color: "#F5C5A3", label: "살구" },
  { color: "#D4A574", label: "황금빛" },
  { color: "#C18E60", label: "카라멜" },
  { color: "#8D5E3C", label: "갈색" },
  { color: "#5C3A21", label: "진한 갈색" },
];

const HAIR_LENGTHS = [
  {
    value: "short",
    label: "숏컷",
    svg: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-10 h-10"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      >
        <circle cx="24" cy="20" r="8" />
        <path d="M16 18c0-6 3.5-10 8-10s8 4 8 10" />
        <path d="M15 20c-1 1-2 3-1.5 5" />
        <path d="M33 20c1 1 2 3 1.5 5" />
      </svg>
    ),
  },
  {
    value: "medium",
    label: "미디엄",
    svg: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-10 h-10"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      >
        <circle cx="24" cy="20" r="8" />
        <path d="M16 18c0-6 3.5-10 8-10s8 4 8 10" />
        <path d="M15 20c-2 3-3 8-2 14" />
        <path d="M33 20c2 3 3 8 2 14" />
      </svg>
    ),
  },
  {
    value: "long",
    label: "롱",
    svg: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-10 h-10"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      >
        <circle cx="24" cy="20" r="8" />
        <path d="M16 18c0-6 3.5-10 8-10s8 4 8 10" />
        <path d="M14 20c-3 5-4 14-2 22" />
        <path d="M34 20c3 5 4 14 2 22" />
        <path d="M18 22c-1 6-1 14 0 20" />
        <path d="M30 22c1 6 1 14 0 20" />
      </svg>
    ),
  },
  {
    value: "twintail",
    label: "트윈테일",
    svg: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-10 h-10"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      >
        <circle cx="24" cy="20" r="8" />
        <path d="M16 18c0-6 3.5-10 8-10s8 4 8 10" />
        <path d="M16 17c-4 2-8 8-9 18" />
        <path d="M14 20c-3 4-5 10-5 16" />
        <path d="M32 17c4 2 8 8 9 18" />
        <path d="M34 20c3 4 5 10 5 16" />
      </svg>
    ),
  },
];

const HAIR_COLORS = [
  { value: "black", color: "#1a1a1a", label: "블랙" },
  { value: "brown", color: "#8B5E3C", label: "브라운" },
  { value: "blonde", color: "#E8C872", label: "블론드" },
  { value: "pink", color: "#F28DA0", label: "핑크" },
  { value: "blue", color: "#5B9BD5", label: "파랑" },
  { value: "purple", color: "#9B72CF", label: "보라" },
  { value: "red", color: "#D94F4F", label: "레드" },
  { value: "white", color: "#E8E8E8", label: "화이트" },
];

const STYLE_PRESETS = [
  {
    value: "idol",
    label: "아이돌",
    desc: "화려하고 트렌디한",
    icon: Sparkles,
  },
  {
    value: "pure",
    label: "청순",
    desc: "맑고 깨끗한 분위기",
    icon: Flower2,
  },
  {
    value: "powerful",
    label: "파워풀",
    desc: "강렬하고 카리스마",
    icon: Zap,
  },
  {
    value: "dark",
    label: "다크",
    desc: "어둡고 신비로운",
    icon: Moon,
  },
  {
    value: "fantasy",
    label: "판타지",
    desc: "비현실적 몽환미",
    icon: Crown,
  },
  {
    value: "retro",
    label: "레트로",
    desc: "복고풍 감성",
    icon: Music,
  },
];

const QUICK_TAGS = [
  "안경",
  "보조개",
  "큰 눈",
  "날카로운 눈매",
  "고양이상",
  "강아지상",
  "쌍꺼풀",
  "긴 속눈썹",
];

export default function VirtualStudioPage() {
  const [showArtistSelector, setShowArtistSelector] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const [gender, setGender] = useState("female");
  const [skinTone, setSkinTone] = useState(SKIN_TONES[1].color);
  const [hairLength, setHairLength] = useState("medium");
  const [hairColor, setHairColor] = useState("black");
  const [stylePreset, setStylePreset] = useState("idol");
  const [customPrompt, setCustomPrompt] = useState("");

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showPublish, setShowPublish] = useState(false);

  const handleArtistSelect = (artist: Artist | null) => {
    setSelectedArtist(artist);
    setShowArtistSelector(false);
  };

  const addTag = (tag: string) => {
    setCustomPrompt((prev) => {
      if (prev.includes(tag)) return prev;
      return prev ? `${prev}, ${tag}` : tag;
    });
  };

  const pollJob = useCallback(async (jobId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/ai/jobs/${jobId}`);
      const data = await res.json();
      if (data.success && data.data.status === "COMPLETED") {
        clearInterval(interval);
        setResultImage(data.data.outputData?.imageUrl || null);
        setGenerating(false);
        setProgress(100);
      } else if (data.data?.status === "FAILED") {
        clearInterval(interval);
        setGenerating(false);
        setProgress(0);
      }
    }, 3000);
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setResultImage(null);
    setProgress(0);

    // 프로그레스 시뮬레이션
    const progressInterval = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + Math.random() * 8));
    }, 500);

    const hairDesc = `${HAIR_COLORS.find((h) => h.value === hairColor)?.label || ""} ${HAIR_LENGTHS.find((h) => h.value === hairLength)?.label || ""} 헤어`;
    const fullPrompt = [hairDesc, customPrompt].filter(Boolean).join(", ");

    try {
      const res = await fetch("/api/ai/virtual/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender,
          skinTone,
          stylePreset,
          customPrompt: fullPrompt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        pollJob(data.data.jobId);
      } else {
        setGenerating(false);
        clearInterval(progressInterval);
      }
    } catch {
      setGenerating(false);
      clearInterval(progressInterval);
    }
  };

  const selectedGenderLabel =
    GENDERS.find((g) => g.value === gender)?.label || "";
  const selectedSkinLabel =
    SKIN_TONES.find((s) => s.color === skinTone)?.label || "";
  const selectedHairLenLabel =
    HAIR_LENGTHS.find((h) => h.value === hairLength)?.label || "";
  const selectedHairColLabel =
    HAIR_COLORS.find((h) => h.value === hairColor)?.label || "";
  const selectedStyleLabel =
    STYLE_PRESETS.find((s) => s.value === stylePreset)?.label || "";

  return (
    <div className="min-h-screen bg-white">
      <ArtistSelector
        isOpen={showArtistSelector}
        onClose={() => setShowArtistSelector(false)}
        onSelect={handleArtistSelect}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            버추얼 아이돌 스튜디오
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            나만의 버추얼 아이돌을 디자인하세요
          </p>
          {selectedArtist && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-gray-900 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                {selectedArtist.name}
              </span>
              <button
                onClick={() => setShowArtistSelector(true)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                변경
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* 왼쪽: 커스터마이즈 패널 */}
          <div className="flex-1 min-w-0 space-y-10">
            {/* 섹션 1: 캐릭터 기본 */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-lg font-bold text-gray-900">
                  캐릭터 기본
                </h2>
              </div>

              {/* 성별 */}
              <p className="text-sm font-medium text-gray-700 mb-3">성별</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {GENDERS.map((g) => {
                  const Icon = g.icon;
                  const selected = gender === g.value;
                  return (
                    <button
                      key={g.value}
                      onClick={() => setGender(g.value)}
                      className={`flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all duration-200 ${
                        selected
                          ? "border-black bg-black text-white scale-[1.02]"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-semibold">{g.label}</span>
                      <span
                        className={`text-[11px] ${selected ? "text-gray-300" : "text-gray-400"}`}
                      >
                        {g.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 피부톤 */}
              <p className="text-sm font-medium text-gray-700 mb-3">피부톤</p>
              <div className="flex gap-3">
                {SKIN_TONES.map((tone) => {
                  const selected = skinTone === tone.color;
                  return (
                    <button
                      key={tone.color}
                      onClick={() => setSkinTone(tone.color)}
                      className="group relative flex flex-col items-center gap-1.5"
                    >
                      <div
                        className={`w-11 h-11 rounded-full transition-all duration-200 flex items-center justify-center ${
                          selected
                            ? "ring-2 ring-black ring-offset-2 scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: tone.color }}
                      >
                        {selected && (
                          <Check className="w-4 h-4 text-white drop-shadow-md" />
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {tone.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 섹션 2: 헤어스타일 */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-lg font-bold text-gray-900">
                  헤어스타일
                </h2>
              </div>

              {/* 헤어 길이 */}
              <p className="text-sm font-medium text-gray-700 mb-3">
                헤어 길이
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {HAIR_LENGTHS.map((h) => {
                  const selected = hairLength === h.value;
                  return (
                    <button
                      key={h.value}
                      onClick={() => setHairLength(h.value)}
                      className={`flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all duration-200 ${
                        selected
                          ? "border-black bg-black text-white scale-[1.02]"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {h.svg}
                      <span className="text-sm font-semibold">{h.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 헤어 컬러 */}
              <p className="text-sm font-medium text-gray-700 mb-3">
                헤어 컬러
              </p>
              <div className="flex flex-wrap gap-3">
                {HAIR_COLORS.map((h) => {
                  const selected = hairColor === h.value;
                  return (
                    <button
                      key={h.value}
                      onClick={() => setHairColor(h.value)}
                      className="group relative flex flex-col items-center gap-1.5"
                    >
                      <div
                        className={`w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center ${
                          selected
                            ? "ring-2 ring-black ring-offset-2 scale-110"
                            : "hover:scale-105"
                        } ${h.value === "white" ? "border border-gray-200" : ""}`}
                        style={{ backgroundColor: h.color }}
                      >
                        {selected && (
                          <Check
                            className={`w-3.5 h-3.5 drop-shadow-md ${h.value === "white" || h.value === "blonde" ? "text-gray-800" : "text-white"}`}
                          />
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {h.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 섹션 3: 스타일 무드 */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-lg font-bold text-gray-900">
                  스타일 무드
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {STYLE_PRESETS.map((s) => {
                  const Icon = s.icon;
                  const selected = stylePreset === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => setStylePreset(s.value)}
                      className={`flex flex-col items-start gap-1.5 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                        selected
                          ? "border-black bg-black text-white scale-[1.02]"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${selected ? "text-white" : "text-gray-400"}`}
                      />
                      <span className="text-sm font-bold">{s.label}</span>
                      <span
                        className={`text-[11px] leading-tight ${selected ? "text-gray-300" : "text-gray-400"}`}
                      >
                        {s.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 섹션 4: 추가 묘사 */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h2 className="text-lg font-bold text-gray-900">
                  추가 묘사
                </h2>
                <span className="text-xs text-gray-400 ml-1">선택사항</span>
              </div>

              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="원하는 특징을 자유롭게 설명해주세요..."
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none transition-all"
              />

              <div className="flex flex-wrap gap-2 mt-3">
                {QUICK_TAGS.map((tag) => {
                  const isActive = customPrompt.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                        isActive
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-400"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* 오른쪽: 프리뷰 (sticky) */}
          <div className="lg:w-[400px] flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-5">
              <p className="text-sm font-bold text-gray-900">
                나의 버추얼 아이돌
              </p>

              {/* 프리뷰 영역 */}
              <div className="aspect-[3/4] rounded-2xl overflow-hidden relative">
                {generating ? (
                  /* 생성 중 */
                  <div className="w-full h-full bg-gray-950 flex flex-col items-center justify-center gap-5 px-8">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                    <p className="text-white text-sm font-medium">
                      AI가 아이돌을 창조하는 중...
                    </p>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-gray-500 text-xs">
                      {Math.round(progress)}%
                    </p>
                  </div>
                ) : resultImage ? (
                  /* 생성 완료 */
                  <Image
                    src={resultImage}
                    alt="Generated virtual idol"
                    width={640}
                    height={640}
                    className="w-full h-full object-cover rounded-2xl"
                    unoptimized
                  />
                ) : (
                  /* 생성 전: 플레이스홀더 */
                  <div className="w-full h-full bg-gray-950 flex flex-col items-center justify-center relative">
                    <User className="w-20 h-20 text-white/10" />
                    <p className="text-white/30 text-xs mt-4">
                      캐릭터가 여기에 나타납니다
                    </p>
                    {/* 별빛 pulse */}
                    <div
                      className="absolute w-1.5 h-1.5 bg-white/20 rounded-full"
                      style={{
                        top: "20%",
                        left: "25%",
                        animation: "starPulse 2s ease-in-out infinite",
                      }}
                    />
                    <div
                      className="absolute w-1 h-1 bg-white/15 rounded-full"
                      style={{
                        top: "35%",
                        right: "20%",
                        animation: "starPulse 2.5s ease-in-out infinite 0.5s",
                      }}
                    />
                    <div
                      className="absolute w-2 h-2 bg-white/10 rounded-full"
                      style={{
                        bottom: "30%",
                        left: "35%",
                        animation: "starPulse 3s ease-in-out infinite 1s",
                      }}
                    />
                    <div
                      className="absolute w-1 h-1 bg-white/20 rounded-full"
                      style={{
                        bottom: "20%",
                        right: "30%",
                        animation: "starPulse 2.2s ease-in-out infinite 1.5s",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 선택사항 요약 배지 */}
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium">
                  {selectedGenderLabel}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium">
                  {selectedSkinLabel}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium">
                  {selectedHairColLabel} {selectedHairLenLabel}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium">
                  {selectedStyleLabel}
                </span>
              </div>

              {/* 생성 / 하단 버튼 */}
              {resultImage ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-2 border-black text-black rounded-2xl hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    재생성
                  </button>
                  <button
                    onClick={() => setShowPublish(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <Send className="w-4 h-4" />
                    피드에 게시
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  {generating
                    ? "생성 중..."
                    : "버추얼 아이돌 생성하기"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <PublishModal
        isOpen={showPublish}
        onClose={() => setShowPublish(false)}
        category="VIRTUAL"
        artistId={selectedArtist?.id}
        contentData={{
          imageUrl: resultImage,
          gender,
          skinTone,
          stylePreset,
        }}
        thumbnailUrl={resultImage || undefined}
      />

      {/* 별빛 pulse 애니메이션 */}
      <style jsx>{`
        @keyframes starPulse {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.8);
          }
        }
      `}</style>
    </div>
  );
}
