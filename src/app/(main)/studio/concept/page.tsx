"use client";

import { useState, useCallback } from "react";
import ArtistSelector from "@/components/common/ArtistSelector";
import AILoadingState from "@/components/studio/AILoadingState";
import PublishModal from "@/components/studio/PublishModal";

const MOODS = ["다크판타지", "청량", "로맨틱", "파워풀", "사이버펑크", "자연/힐링"];

type Artist = { id: string; name: string; nameEn: string | null; groupImageUrl: string | null };
type ConceptResult = {
  logos: string[];
  albumCover: string;
  keyVisual: string;
  palette: string[];
};

export default function ConceptStudioPage() {
  const [showArtistSelector, setShowArtistSelector] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistName, setArtistName] = useState("");
  const [mood, setMood] = useState("");
  const [customMood, setCustomMood] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#ff3d7f");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<ConceptResult | null>(null);
  const [selectedLogo, setSelectedLogo] = useState(0);
  const [showPublish, setShowPublish] = useState(false);

  const handleArtistSelect = (artist: Artist | null) => {
    setSelectedArtist(artist);
    if (artist) setArtistName(artist.name);
    setShowArtistSelector(false);
  };

  const addKeyword = () => {
    if (keywordInput.trim() && keywords.length < 5) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const pollJob = useCallback(async (jobId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/ai/jobs/${jobId}`);
      const data = await res.json();
      if (data.success && data.data.status === "COMPLETED") {
        clearInterval(interval);
        setResult(data.data.outputData as ConceptResult);
        setGenerating(false);
      } else if (data.data?.status === "FAILED") {
        clearInterval(interval);
        setGenerating(false);
        alert("생성에 실패했습니다. 다시 시도해주세요.");
      }
    }, 3000);
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await fetch("/api/ai/concept/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artistName,
        mood: mood === "직접입력" ? customMood : mood,
        keywords,
        primaryColor,
      }),
    });
    const data = await res.json();
    if (data.success) {
      pollJob(data.data.jobId);
    } else {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <ArtistSelector
        isOpen={showArtistSelector}
        onClose={() => setShowArtistSelector(false)}
        onSelect={handleArtistSelect}
      />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">컨셉 스튜디오</h1>

      {generating ? (
        <AILoadingState estimatedSeconds={15} />
      ) : result ? (
        /* 결과 표시 */
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">컨셉 키트 완성!</h2>

          {/* 로고 시안 */}
          <div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-3">로고 시안 (클릭하여 선택)</h3>
            <div className="grid grid-cols-5 gap-3">
              {result.logos.map((logo, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedLogo(i)}
                  className={`aspect-square bg-gray-100 dark:bg-gray-900 rounded-xl border-2 flex items-center justify-center text-2xl transition-colors ${
                    selectedLogo === i ? "border-[#ff3d7f]" : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  🎨
                </button>
              ))}
            </div>
          </div>

          {/* 앨범커버 + 키비주얼 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">앨범 커버</h3>
              <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center text-4xl border border-gray-200 dark:border-gray-800">
                💿
              </div>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">키 비주얼</h3>
              <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center text-4xl border border-gray-200 dark:border-gray-800">
                🖼️
              </div>
            </div>
          </div>

          {/* 색상 팔레트 */}
          <div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">색상 팔레트</h3>
            <div className="flex gap-2">
              {result.palette.map((color, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-700"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowPublish(true)}
              className="bg-[#ff3d7f] text-white px-6 py-2.5 rounded-xl hover:bg-[#e6356f] text-sm"
            >
              피드에 게시
            </button>
            <button
              onClick={() => { setResult(null); }}
              className="border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 px-6 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 text-sm"
            >
              다시 만들기
            </button>
          </div>

          <PublishModal
            isOpen={showPublish}
            onClose={() => setShowPublish(false)}
            category="CONCEPT"
            artistId={selectedArtist?.id}
            contentData={{ ...result, selectedLogo }}
            thumbnailUrl={null}
          />
        </div>
      ) : (
        /* 입력 폼 */
        <div className="space-y-6">
          {selectedArtist && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">선택된 아티스트:</span>
              <span className="text-sm text-[#ff3d7f] bg-[#ff3d7f]/10 px-3 py-1 rounded-full">
                {selectedArtist.name}
              </span>
              <button onClick={() => setShowArtistSelector(true)} className="text-xs text-gray-500 hover:text-gray-300">
                변경
              </button>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">아티스트/그룹명</label>
            <input
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="아티스트 이름"
              className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff3d7f]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">컨셉 무드</label>
            <div className="flex flex-wrap gap-2">
              {[...MOODS, "직접입력"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                    mood === m
                      ? "border-[#ff3d7f] bg-[#ff3d7f]/10 text-[#ff3d7f]"
                      : "border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            {mood === "직접입력" && (
              <input
                value={customMood}
                onChange={(e) => setCustomMood(e.target.value)}
                placeholder="원하는 무드를 입력하세요"
                className="mt-2 w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff3d7f]"
              />
            )}
          </div>

          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">핵심 키워드 (최대 5개)</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {keywords.map((kw, i) => (
                <span key={i} className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                  {kw}
                  <button onClick={() => setKeywords(keywords.filter((_, j) => j !== i))} className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                placeholder="키워드 입력 후 Enter"
                className="flex-1 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#ff3d7f]"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">대표 색상</label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer bg-transparent"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!artistName || !mood}
            className="w-full bg-[#ff3d7f] text-white py-3 rounded-xl hover:bg-[#e6356f] disabled:opacity-50 text-sm font-medium transition-colors"
          >
            컨셉 키트 생성
          </button>
        </div>
      )}
    </div>
  );
}
