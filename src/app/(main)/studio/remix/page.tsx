"use client";

import { useState, useCallback } from "react";
import ArtistSelector from "@/components/common/ArtistSelector";
import FileUploader from "@/components/common/FileUploader";
import AILoadingState from "@/components/studio/AILoadingState";
import PublishModal from "@/components/studio/PublishModal";
import { Play, Pause, RotateCcw, Plus, Minus, Music } from "lucide-react";

type Artist = { id: string; name: string; nameEn: string | null; groupImageUrl: string | null };

const REMIX_STYLES = [
  { value: "dance-pop", label: "댄스팝", emoji: "💃" },
  { value: "acoustic", label: "어쿠스틱", emoji: "🎸" },
  { value: "synthwave", label: "신스웨이브", emoji: "🌊" },
];

export default function RemixStudioPage() {
  const [showArtistSelector, setShowArtistSelector] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [bpm, setBpm] = useState(120);
  const [keyShift, setKeyShift] = useState(0);
  const [step, setStep] = useState(1); // 1: 업로드, 2: 편집, 3: AI 리믹스
  const [separating, setSeparating] = useState(false);
  const [, setSeparated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [remixUrl, setRemixUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showPublish, setShowPublish] = useState(false);

  const handleArtistSelect = (artist: Artist | null) => {
    setSelectedArtist(artist);
    setShowArtistSelector(false);
  };

  const handleUpload = (url: string) => {
    setAudioUrl(url);
    setStep(2);
  };

  const pollJob = useCallback(async (jobId: string, onComplete: (output: Record<string, unknown>) => void) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/ai/jobs/${jobId}`);
      const data = await res.json();
      if (data.success && data.data.status === "COMPLETED") {
        clearInterval(interval);
        onComplete(data.data.outputData);
      } else if (data.data?.status === "FAILED") {
        clearInterval(interval);
        alert("처리에 실패했습니다.");
      }
    }, 3000);
  }, []);

  const handleSeparate = async () => {
    if (!audioUrl) return;
    setSeparating(true);
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
    }
  };

  const handleRemix = async (style: string) => {
    if (!audioUrl) return;
    setSelectedStyle(style);
    setGenerating(true);
    const res = await fetch("/api/ai/remix/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioUrl, style, bpm, key: keyShift }),
    });
    const data = await res.json();
    if (data.success) {
      pollJob(data.data.jobId, (output) => {
        setGenerating(false);
        setRemixUrl(output.remixUrl as string);
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <ArtistSelector
        isOpen={showArtistSelector}
        onClose={() => setShowArtistSelector(false)}
        onSelect={handleArtistSelect}
      />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">리믹스 스튜디오</h1>

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-2 mb-8">
        {["음원 업로드", "편집", "AI 리믹스"].map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-[#ff3d7f] text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
            }`}>
              {i + 1}
            </div>
            <span className={`text-xs ${step === i + 1 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>{s}</span>
            {i < 2 && <div className={`w-8 h-0.5 ${step > i + 1 ? "bg-green-500" : "bg-gray-200 dark:bg-gray-800"}`} />}
          </div>
        ))}
      </div>

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
                  className="w-1 bg-gradient-to-t from-[#ff3d7f] to-[#c084fc] rounded-full"
                  style={{ height: `${20 + Math.random() * 60}%` }}
                />
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <button className="text-gray-400 hover:text-white" onClick={() => setPlaying(!playing)}>
                {playing ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* BPM */}
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">BPM: {bpm}</label>
              <input
                type="range"
                min={60}
                max={200}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full accent-[#ff3d7f]"
              />
              <button onClick={() => setBpm(120)} className="text-xs text-gray-500 hover:text-gray-300 mt-1 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> 원본으로 리셋
              </button>
            </div>

            {/* 키 조정 */}
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">키 조정: {keyShift > 0 ? `+${keyShift}` : keyShift} 반음</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setKeyShift(Math.max(-6, keyShift - 1))} className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full relative">
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#ff3d7f] rounded-full" style={{ left: `${((keyShift + 6) / 12) * 100}%` }} />
                </div>
                <button onClick={() => setKeyShift(Math.min(6, keyShift + 1))} className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSeparate}
            disabled={separating}
            className="w-full bg-[#c084fc] text-white py-3 rounded-xl hover:bg-[#a855f7] disabled:opacity-50 text-sm font-medium"
          >
            {separating ? "파트 분리 중..." : "파트 분리"}
          </button>

          {separating && <AILoadingState estimatedSeconds={20} />}
        </div>
      )}

      {/* Step 3: AI 리믹스 */}
      {step === 3 && (
        <div className="space-y-6">
          <p className="text-green-400 text-sm">파트 분리 완료! 리믹스 스타일을 선택하세요</p>

          <div className="grid grid-cols-3 gap-4">
            {REMIX_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => handleRemix(style.value)}
                disabled={generating}
                className={`p-6 rounded-xl border text-center transition-all ${
                  selectedStyle === style.value
                    ? "border-[#ff3d7f] bg-[#ff3d7f]/10"
                    : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                }`}
              >
                <span className="text-3xl block mb-2">{style.emoji}</span>
                <span className="text-sm text-gray-900 dark:text-white">{style.label}</span>
              </button>
            ))}
          </div>

          {generating && <AILoadingState estimatedSeconds={20} />}

          {remixUrl && (
            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-[#ff3d7f]" />
                <span className="text-gray-900 dark:text-white text-sm">리믹스 완성!</span>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 text-sm border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800">
                  MP3 다운로드
                </button>
                <button
                  onClick={() => setShowPublish(true)}
                  className="flex-1 py-2.5 text-sm bg-[#ff3d7f] text-white rounded-xl hover:bg-[#e6356f]"
                >
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
            contentData={{ remixUrl, style: selectedStyle, bpm, keyShift }}
            fileUrls={remixUrl ? [remixUrl] : []}
          />
        </div>
      )}
    </div>
  );
}
