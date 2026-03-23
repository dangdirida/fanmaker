"use client";

import { useState, useCallback } from "react";
import ArtistSelector from "@/components/common/ArtistSelector";
import FileUploader from "@/components/common/FileUploader";
import AILoadingState from "@/components/studio/AILoadingState";
import PublishModal from "@/components/studio/PublishModal";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Music,
  Sparkles,
  RefreshCw,
} from "lucide-react";

type Artist = {
  id: string;
  name: string;
  nameEn: string | null;
  groupImageUrl: string | null;
};

type RemixResult = {
  remixConcept: string;
  style: string;
  bpm: number;
  keyShift: number;
  artistName: string | null;
};

const REMIX_STYLES = [
  { value: "dance-pop", label: "댄스팝", icon: "" },
  { value: "acoustic", label: "어쿠스틱", icon: "" },
  { value: "synthwave", label: "신스웨이브", icon: "" },
  { value: "lo-fi", label: "로파이", icon: "" },
  { value: "edm", label: "EDM", icon: "" },
  { value: "r&b", label: "R&B", icon: "" },
];

export default function RemixStudioPage() {
  const [showArtistSelector, setShowArtistSelector] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [bpm, setBpm] = useState(120);
  const [keyShift, setKeyShift] = useState(0);
  const [step, setStep] = useState(1);
  const [separating, setSeparating] = useState(false);
  const [, setSeparated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [remixResult, setRemixResult] = useState<RemixResult | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleArtistSelect = (artist: Artist | null) => {
    setSelectedArtist(artist);
    setShowArtistSelector(false);
  };

  const handleUpload = (url: string) => {
    setAudioUrl(url);
    setStep(2);
  };

  const pollJob = useCallback(
    async (jobId: string, onComplete: (output: Record<string, unknown>) => void) => {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/ai/jobs/${jobId}`);
          const data = await res.json();
          if (data.success && data.data.status === "COMPLETED") {
            clearInterval(interval);
            onComplete(data.data.outputData);
          } else if (data.data?.status === "FAILED") {
            clearInterval(interval);
            setSeparating(false);
            setError("파트 분리에 실패했습니다.");
          }
        } catch {
          clearInterval(interval);
          setSeparating(false);
          setError("처리 중 오류가 발생했습니다.");
        }
      }, 3000);
    },
    []
  );

  const handleSeparate = async () => {
    if (!audioUrl) return;
    setSeparating(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/remix/separate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl }),
      });
      const data = await res.json();
      if (data.success) {
        pollJob(data.data.jobId, () => {
          setSeparating(false);
          setSeparated(true);
          setStep(3);
        });
      } else {
        setSeparating(false);
        setError(data.error || "파트 분리에 실패했습니다.");
      }
    } catch {
      setSeparating(false);
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  const handleRemix = async (style: string) => {
    setSelectedStyle(style);
    setGenerating(true);
    setError(null);
    setRemixResult(null);

    try {
      const res = await fetch("/api/ai/remix/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioUrl,
          style,
          bpm,
          key: keyShift,
          artistName: selectedArtist?.name || null,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setRemixResult(data.data);
      } else {
        setError(data.error || "리믹스 생성에 실패했습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setGenerating(false);
    }
  };

  // 마크다운 섹션 파싱
  const parseSections = (text: string) => {
    const sections: { title: string; content: string }[] = [];
    const lines = text.split("\n");
    let currentTitle = "";
    let currentContent: string[] = [];

    for (const line of lines) {
      const headingMatch = line.match(/^#{1,3}\s+\*{0,2}(.+?)\*{0,2}\s*$/);
      if (headingMatch) {
        if (currentTitle || currentContent.length > 0) {
          sections.push({
            title: currentTitle,
            content: currentContent.join("\n").trim(),
          });
        }
        currentTitle = headingMatch[1].replace(/\*+/g, "").trim();
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    if (currentTitle || currentContent.length > 0) {
      sections.push({
        title: currentTitle,
        content: currentContent.join("\n").trim(),
      });
    }

    return sections.filter((s) => s.content.length > 0);
  };

  const SECTION_COLORS = [
    "from-violet-500/10 to-fuchsia-500/10 border-violet-500/20",
    "from-cyan-500/10 to-blue-500/10 border-cyan-500/20",
    "from-amber-500/10 to-orange-500/10 border-amber-500/20",
    "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
    "from-rose-500/10 to-pink-500/10 border-rose-500/20",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <ArtistSelector
        isOpen={showArtistSelector}
        onClose={() => setShowArtistSelector(false)}
        onSelect={handleArtistSelect}
      />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        리믹스 스튜디오
      </h1>
      {selectedArtist && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          아티스트:{" "}
          <button
            onClick={() => setShowArtistSelector(true)}
            className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
          >
            {selectedArtist.name}
          </button>
        </p>
      )}

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-2 mb-8">
        {["음원 업로드", "편집", "AI 리믹스"].map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                step > i + 1
                  ? "bg-green-500 text-white"
                  : step === i + 1
                    ? "bg-black text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
              }`}
            >
              {step > i + 1 ? "" : i + 1}
            </div>
            <span
              className={`text-xs ${step === i + 1 ? "text-gray-900 dark:text-white font-medium" : "text-gray-400 dark:text-gray-500"}`}
            >
              {s}
            </span>
            {i < 2 && (
              <div
                className={`w-8 h-0.5 ${step > i + 1 ? "bg-green-500" : "bg-gray-200 dark:bg-gray-800"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: 업로드 */}
      {step === 1 && (
        <FileUploader
          accept="audio/mpeg,audio/wav,audio/aac"
          maxMB={50}
          bucket="audio"
          onUpload={handleUpload}
          label="음원 파일을 업로드하세요 (MP3, WAV, AAC)"
        />
      )}

      {/* Step 2: 편집 */}
      {step === 2 && (
        <div className="space-y-6">
          {/* 파형 플레이스홀더 */}
          <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="h-24 flex items-center justify-center gap-1">
              {Array.from({ length: 60 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-black to-gray-700 rounded-full"
                  style={{ height: `${20 + Math.random() * 60}%` }}
                />
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <button
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setPlaying(!playing)}
              >
                {playing ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* BPM */}
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">
                BPM: {bpm}
              </label>
              <input
                type="range"
                min={60}
                max={200}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full accent-[#000000]"
              />
              <button
                onClick={() => setBpm(120)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-1 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> 원본으로 리셋
              </button>
            </div>

            {/* 키 조정 */}
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">
                키 조정: {keyShift > 0 ? `+${keyShift}` : keyShift} 반음
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setKeyShift(Math.max(-6, keyShift - 1))}
                  className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full relative">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full"
                    style={{ left: `${((keyShift + 6) / 12) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => setKeyShift(Math.min(6, keyShift + 1))}
                  className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSeparate}
            disabled={separating}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            {separating ? "파트 분리 중..." : "파트 분리 시작"}
          </button>

          {separating && <AILoadingState estimatedSeconds={20} />}
        </div>
      )}

      {/* Step 3: AI 리믹스 */}
      {step === 3 && (
        <div className="space-y-6">
          <p className="text-green-600 dark:text-green-400 text-sm font-medium">
            파트 분리 완료! 리믹스 스타일을 선택하세요
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {REMIX_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => handleRemix(style.value)}
                disabled={generating}
                className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                  selectedStyle === style.value
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm"
                } disabled:opacity-50`}
              >
                <span className="text-2xl block mb-1.5">{style.icon}</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {style.label}
                </span>
              </button>
            ))}
          </div>

          {generating && <AILoadingState estimatedSeconds={15} />}

          {/* 리믹스 결과 카드 */}
          {remixResult && !generating && (
            <div className="space-y-4">
              {/* 헤더 카드 */}
              <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI 리믹스 컨셉 완성</h3>
                    <p className="text-white/70 text-sm">
                      {remixResult.artistName && `${remixResult.artistName} · `}
                      {remixResult.style} · BPM {remixResult.bpm} ·{" "}
                      {remixResult.keyShift === 0
                        ? "원키"
                        : remixResult.keyShift > 0
                          ? `+${remixResult.keyShift}`
                          : remixResult.keyShift}
                    </p>
                  </div>
                </div>
              </div>

              {/* 섹션별 카드 */}
              {parseSections(remixResult.remixConcept).map((section, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-5 bg-gradient-to-br ${SECTION_COLORS[i % SECTION_COLORS.length]}`}
                >
                  {section.title && (
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                      {section.title}
                    </h4>
                  )}
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
              ))}

              {/* 액션 버튼 */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setRemixResult(null);
                    setSelectedStyle(null);
                  }}
                  className="flex-1 py-3 text-sm border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  다른 스타일로 다시 생성
                </button>
                <button
                  onClick={() => setShowPublish(true)}
                  className="flex-1 py-3 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Music className="w-4 h-4" />
                  피드에 게시
                </button>
              </div>
            </div>
          )}

          <PublishModal
            isOpen={showPublish}
            onClose={() => setShowPublish(false)}
            category="REMIX"
            artistId={selectedArtist?.id}
            contentData={{
              remixConcept: remixResult?.remixConcept,
              style: selectedStyle,
              bpm,
              keyShift,
            }}
            fileUrls={[]}
          />
        </div>
      )}
    </div>
  );
}
