"use client";

import { useState, useCallback } from "react";
import ArtistSelector from "@/components/common/ArtistSelector";
import AILoadingState from "@/components/studio/AILoadingState";
import PublishModal from "@/components/studio/PublishModal";

type Artist = { id: string; name: string; nameEn: string | null; groupImageUrl: string | null };

const GENDERS = [
  { value: "female", label: "여성" },
  { value: "male", label: "남성" },
  { value: "neutral", label: "중성" },
];

const SKIN_TONES = ["#FAD7C0", "#F5C5A3", "#D4A574", "#C18E60", "#8D5E3C", "#5C3A21"];

const STYLE_PRESETS = [
  { value: "idol", label: "아이돌" },
  { value: "pure", label: "청순" },
  { value: "powerful", label: "파워풀" },
  { value: "dark", label: "다크" },
  { value: "fantasy", label: "판타지" },
  { value: "retro", label: "레트로" },
];

export default function VirtualStudioPage() {
  const [showArtistSelector, setShowArtistSelector] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [gender, setGender] = useState("female");
  const [skinTone, setSkinTone] = useState(SKIN_TONES[1]);
  const [stylePreset, setStylePreset] = useState("idol");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showPublish, setShowPublish] = useState(false);

  const handleArtistSelect = (artist: Artist | null) => {
    setSelectedArtist(artist);
    setShowArtistSelector(false);
  };

  const pollJob = useCallback(async (jobId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/ai/jobs/${jobId}`);
      const data = await res.json();
      if (data.success && data.data.status === "COMPLETED") {
        clearInterval(interval);
        setResultImage(data.data.outputData?.imageUrl || null);
        setGenerating(false);
      } else if (data.data?.status === "FAILED") {
        clearInterval(interval);
        setGenerating(false);
        alert("생성에 실패했습니다.");
      }
    }, 3000);
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setResultImage(null);
    const res = await fetch("/api/ai/virtual/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gender, skinTone, stylePreset, customPrompt }),
    });
    const data = await res.json();
    if (data.success) pollJob(data.data.jobId);
    else setGenerating(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <ArtistSelector
        isOpen={showArtistSelector}
        onClose={() => setShowArtistSelector(false)}
        onSelect={handleArtistSelect}
      />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">버추얼 스튜디오</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 좌: 편집 패널 */}
        <div className="space-y-5">
          {selectedArtist && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-black bg-black/10 px-3 py-1 rounded-full">
                {selectedArtist.name}
              </span>
              <button onClick={() => setShowArtistSelector(true)} className="text-xs text-gray-500">변경</button>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">성별</label>
            <div className="flex gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGender(g.value)}
                  className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${
                    gender === g.value
                      ? "border-black bg-black/10 text-black"
                      : "border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">피부톤</label>
            <div className="flex gap-2">
              {SKIN_TONES.map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSkinTone(tone)}
                  className={`w-10 h-10 rounded-full border-2 transition-colors ${
                    skinTone === tone ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: tone }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">스타일 프리셋</label>
            <div className="grid grid-cols-3 gap-2">
              {STYLE_PRESETS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStylePreset(s.value)}
                  className={`py-2 text-sm rounded-xl border transition-colors ${
                    stylePreset === s.value
                      ? "border-gray-700 bg-black/10 text-gray-700"
                      : "border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">추가 묘사</label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="원하는 스타일을 자유롭게 설명해주세요 (한국어/영어)"
              rows={3}
              className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            이미지 생성
          </button>
        </div>

        {/* 우: 프리뷰 */}
        <div>
          {generating ? (
            <AILoadingState estimatedSeconds={15} />
          ) : resultImage ? (
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center text-6xl">
                🎭
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  className="flex-1 py-2.5 text-sm border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  재생성
                </button>
                <button
                  onClick={() => setShowPublish(true)}
                  className="flex-1 py-2.5 text-sm bg-black text-white rounded-xl hover:bg-gray-800"
                >
                  피드에 게시
                </button>
              </div>
              <PublishModal
                isOpen={showPublish}
                onClose={() => setShowPublish(false)}
                category="VIRTUAL"
                artistId={selectedArtist?.id}
                contentData={{ imageUrl: resultImage, gender, skinTone, stylePreset }}
                thumbnailUrl={resultImage}
              />
            </div>
          ) : (
            <div className="aspect-[3/4] bg-gray-100/50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center">
              <p className="text-gray-600 text-sm">생성된 이미지가 여기에 표시됩니다</p>
              <p className="text-gray-700 text-xs mt-1">좌측에서 옵션을 선택하고 생성하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
