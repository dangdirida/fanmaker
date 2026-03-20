"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import ArtistSelector from "@/components/common/ArtistSelector";
import FileUploader from "@/components/common/FileUploader";
import AILoadingState from "@/components/studio/AILoadingState";
import PublishModal from "@/components/studio/PublishModal";
import {
  Globe,
  Languages,
  Download,
  RefreshCw,
  Link,
  Upload,
  ChevronRight,
  Edit3,
  Play,
} from "lucide-react";

type Artist = {
  id: string;
  name: string;
  nameEn: string | null;
  groupImageUrl: string | null;
};

type SubtitleLine = {
  id: number;
  startTime: string;
  endTime: string;
  original: string;
  translated: string;
};

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "영어", flag: "🇺🇸" },
  { code: "ja", name: "일본어", flag: "🇯🇵" },
  { code: "zh-CN", name: "중국어(간체)", flag: "🇨🇳" },
  { code: "zh-TW", name: "중국어(번체)", flag: "🇹🇼" },
  { code: "es", name: "스페인어", flag: "🇪🇸" },
  { code: "pt", name: "포르투갈어", flag: "🇧🇷" },
  { code: "th", name: "태국어", flag: "🇹🇭" },
  { code: "id", name: "인도네시아어", flag: "🇮🇩" },
  { code: "vi", name: "베트남어", flag: "🇻🇳" },
  { code: "fr", name: "프랑스어", flag: "🇫🇷" },
];

export default function GlobalSyncPage() {
  // 아티스트 선택
  const [showArtistSelector, setShowArtistSelector] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  // 스텝 관리: 1=영상 소스, 2=번역 설정, 3=자막 편집
  const [step, setStep] = useState(1);

  // Step 1: 영상 소스
  const [sourceType, setSourceType] = useState<"youtube" | "upload">("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Step 2: 번역 설정
  const [targetLang, setTargetLang] = useState("en");
  const [generating, setGenerating] = useState(false);

  // Step 3: 자막 편집
  const [subtitles, setSubtitles] = useState<SubtitleLine[]>([]);

  // 게시 모달
  const [showPublish, setShowPublish] = useState(false);

  const handleArtistSelect = (artist: Artist | null) => {
    setSelectedArtist(artist);
    setShowArtistSelector(false);
  };

  const handleVideoUpload = (url: string) => {
    setVideoUrl(url);
  };

  // YouTube URL에서 썸네일 ID 추출
  const getYoutubeId = (url: string): string | null => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  const canProceedStep1 = sourceType === "youtube" ? !!getYoutubeId(youtubeUrl) : !!videoUrl;

  // 자막 생성 (시뮬레이션)
  const handleGenerateSubtitles = useCallback(async () => {
    setGenerating(true);

    // AI 자막 생성 API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const mockSubtitles: SubtitleLine[] = [
      { id: 1, startTime: "00:00:01", endTime: "00:00:04", original: "안녕하세요 여러분", translated: "" },
      { id: 2, startTime: "00:00:05", endTime: "00:00:08", original: "오늘 새로운 영상을 준비했어요", translated: "" },
      { id: 3, startTime: "00:00:09", endTime: "00:00:12", original: "많은 관심 부탁드려요", translated: "" },
      { id: 4, startTime: "00:00:13", endTime: "00:00:16", original: "그럼 시작해볼까요", translated: "" },
      { id: 5, startTime: "00:00:17", endTime: "00:00:20", original: "감사합니다", translated: "" },
    ];

    // 번역 시뮬레이션
    const targetName = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name || "";
    const translations: Record<string, Record<string, string>> = {
      en: {
        "안녕하세요 여러분": "Hello everyone",
        "오늘 새로운 영상을 준비했어요": "I prepared a new video today",
        "많은 관심 부탁드려요": "Please show lots of interest",
        "그럼 시작해볼까요": "Shall we get started?",
        감사합니다: "Thank you",
      },
      ja: {
        "안녕하세요 여러분": "皆さん、こんにちは",
        "오늘 새로운 영상을 준비했어요": "今日は新しい動画を用意しました",
        "많은 관심 부탁드려요": "たくさんの関心をお願いします",
        "그럼 시작해볼까요": "それでは始めましょうか",
        감사합니다: "ありがとうございます",
      },
    };

    const translated = mockSubtitles.map((sub) => ({
      ...sub,
      translated:
        translations[targetLang]?.[sub.original] ||
        `[${targetName} 번역] ${sub.original}`,
    }));

    setSubtitles(translated);
    setGenerating(false);
    setStep(3);
  }, [targetLang]);

  // 자막 수정
  const updateSubtitle = (id: number, field: "original" | "translated", value: string) => {
    setSubtitles((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, [field]: value } : sub))
    );
  };

  // 전체 재번역
  const handleRetranslateAll = async () => {
    setGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const targetName = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name || "";
    setSubtitles((prev) =>
      prev.map((sub) => ({
        ...sub,
        translated: `[${targetName} 재번역] ${sub.original}`,
      }))
    );
    setGenerating(false);
  };

  // SRT 다운로드
  const handleDownloadSRT = () => {
    const srtContent = subtitles
      .map(
        (sub, i) =>
          `${i + 1}\n${sub.startTime},000 --> ${sub.endTime},000\n${sub.translated}\n`
      )
      .join("\n");

    const blob = new Blob([srtContent], { type: "text/srt" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subtitles.srt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <ArtistSelector
        isOpen={showArtistSelector}
        onClose={() => setShowArtistSelector(false)}
        onSelect={handleArtistSelect}
      />
      {/* 헤더 */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-black" />
            <div>
              <h1 className="text-lg font-bold">Global Sync</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500">자막 / 번역 스튜디오</p>
            </div>
          </div>
          {selectedArtist && (
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-full">
              <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden">
                {selectedArtist.groupImageUrl ? (
                  <Image
                    src={selectedArtist.groupImageUrl}
                    alt={selectedArtist.name}
                    width={20}
                    height={20}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-[10px] flex items-center justify-center h-full text-gray-400">
                    {selectedArtist.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-300">{selectedArtist.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-8">
          {[
            { num: 1, label: "영상 소스" },
            { num: 2, label: "번역 설정" },
            { num: 3, label: "자막 편집" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (s.num < step) setStep(s.num);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  step === s.num
                    ? "bg-black text-white"
                    : step > s.num
                    ? "bg-black/20 text-black cursor-pointer"
                    : "bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500"
                }`}
              >
                <span>{s.num}</span>
                <span>{s.label}</span>
              </button>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-600" />}
            </div>
          ))}
        </div>

        {/* Step 1: 영상 소스 */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">영상 소스 선택</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                자막을 생성할 영상을 선택하세요
              </p>
            </div>

            {/* 소스 타입 토글 */}
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
              <button
                onClick={() => setSourceType("youtube")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                  sourceType === "youtube"
                    ? "bg-black text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Link className="w-4 h-4" />
                YouTube URL
              </button>
              <button
                onClick={() => setSourceType("upload")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                  sourceType === "upload"
                    ? "bg-black text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Upload className="w-4 h-4" />
                MP4 업로드
              </button>
            </div>

            {/* YouTube URL 입력 */}
            {sourceType === "youtube" && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                />
                {getYoutubeId(youtubeUrl) && (
                  <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <Image
                        src={`https://img.youtube.com/vi/${getYoutubeId(youtubeUrl)}/hqdefault.jpg`}
                        alt="YouTube 썸네일"
                        width={640}
                        height={360}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 truncate">{youtubeUrl}</p>
                  </div>
                )}
              </div>
            )}

            {/* MP4 업로드 */}
            {sourceType === "upload" && (
              <FileUploader
                accept="video/mp4,video/*"
                maxMB={500}
                bucket="videos"
                onUpload={handleVideoUpload}
                label="MP4 영상을 드래그하거나 클릭해서 선택하세요"
              />
            )}

            {/* 다음 단계 버튼 */}
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              다음 단계
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: 번역 설정 */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">번역 설정</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                원본 언어와 번역할 언어를 설정하세요
              </p>
            </div>

            {/* 원본 언어 */}
            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4">
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">원본 언어</label>
              <div className="flex items-center gap-3 bg-gray-200 dark:bg-gray-800 rounded-lg px-4 py-3">
                <span className="text-lg">🇰🇷</span>
                <span className="text-gray-900 dark:text-white font-medium">한국어</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">고정</span>
              </div>
            </div>

            {/* 번역 대상 언어 */}
            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4">
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-3 block">
                번역 대상 언어
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setTargetLang(lang.code)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                      targetLang === lang.code
                        ? "bg-black/20 border border-black text-white"
                        : "bg-gray-200 dark:bg-gray-800 border border-transparent text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600"
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 번역 방향 표시 */}
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-full">
                <span>🇰🇷</span>
                <span className="text-sm text-gray-300">한국어</span>
              </div>
              <Languages className="w-5 h-5 text-black" />
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-full">
                <span>
                  {SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.flag}
                </span>
                <span className="text-sm text-gray-300">
                  {SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name}
                </span>
              </div>
            </div>

            {/* 자막 생성 버튼 */}
            <button
              onClick={handleGenerateSubtitles}
              disabled={generating}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Languages className="w-5 h-5" />
              자막 생성하기
            </button>
          </div>
        )}

        {/* AI 로딩 */}
        {generating && <AILoadingState estimatedSeconds={15} />}

        {/* Step 3: 자막 편집 */}
        {step === 3 && !generating && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">자막 편집</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRetranslateAll}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  전체 재번역
                </button>
                <button
                  onClick={handleDownloadSRT}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  SRT 다운로드
                </button>
                <button
                  onClick={() => setShowPublish(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm hover:bg-gray-800 transition-colors"
                >
                  피드에 게시
                </button>
              </div>
            </div>

            {/* 2컬럼 레이아웃 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 왼쪽: 비디오 플레이어 */}
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center">
                  {sourceType === "youtube" && getYoutubeId(youtubeUrl) ? (
                    <div className="w-full h-full relative rounded-xl overflow-hidden">
                      <Image
                        src={`https://img.youtube.com/vi/${getYoutubeId(youtubeUrl)}/hqdefault.jpg`}
                        alt="YouTube 썸네일"
                        width={640}
                        height={360}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-black/80 flex items-center justify-center">
                          <Play className="w-7 h-7 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Play className="w-12 h-12 text-gray-600 mx-auto" />
                      <p className="text-sm text-gray-500">비디오 미리보기</p>
                    </div>
                  )}
                </div>

                {/* 번역 정보 */}
                <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>🇰🇷</span>
                      <span className="text-gray-600 dark:text-gray-300">한국어</span>
                    </div>
                    <Languages className="w-4 h-4 text-black" />
                    <div className="flex items-center gap-2">
                      <span>
                        {SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.flag}
                      </span>
                      <span className="text-gray-300">
                        {SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    총 {subtitles.length}개 자막 라인
                  </p>
                </div>
              </div>

              {/* 오른쪽: 자막 리스트 */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {subtitles.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 space-y-3 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                  >
                    {/* 타임스탬프 */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded font-mono">
                        {sub.startTime}
                      </span>
                      <span>~</span>
                      <span className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded font-mono">
                        {sub.endTime}
                      </span>
                    </div>

                    {/* 원본 한국어 */}
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">
                        🇰🇷 원본 (한국어)
                      </label>
                      <input
                        type="text"
                        value={sub.original}
                        onChange={(e) =>
                          updateSubtitle(sub.id, "original", e.target.value)
                        }
                        className="w-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                      />
                    </div>

                    {/* 번역 텍스트 */}
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block flex items-center gap-1">
                        {SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.flag}{" "}
                        번역 (
                        {SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name})
                        <Edit3 className="w-3 h-3 text-gray-600" />
                      </label>
                      <input
                        type="text"
                        value={sub.translated}
                        onChange={(e) =>
                          updateSubtitle(sub.id, "translated", e.target.value)
                        }
                        className="w-full bg-gray-200 dark:bg-gray-800 border border-black/30 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 게시 모달 */}
      <PublishModal
        isOpen={showPublish}
        onClose={() => setShowPublish(false)}
        category="GLOBAL_SYNC"
        artistId={selectedArtist?.id}
        contentData={{
          sourceType,
          youtubeUrl: sourceType === "youtube" ? youtubeUrl : undefined,
          videoUrl: sourceType === "upload" ? videoUrl : undefined,
          targetLang,
          subtitles,
        }}
        thumbnailUrl={
          sourceType === "youtube" && getYoutubeId(youtubeUrl)
            ? `https://img.youtube.com/vi/${getYoutubeId(youtubeUrl)}/hqdefault.jpg`
            : null
        }
      />
    </div>
  );
}
