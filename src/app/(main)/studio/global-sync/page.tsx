"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import ArtistSelector from "@/components/common/ArtistSelector";
import FileUploader from "@/components/common/FileUploader";
import AILoadingState from "@/components/studio/AILoadingState";
import PublishModal from "@/components/studio/PublishModal";
import {
  Globe, Languages, Download, RefreshCw,
  Link, Upload, ChevronRight, Edit3,
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
  startMs: number;
  original: string;
  translated: string;
};
const SUPPORTED_LANGUAGES = [
  { code: "en",    name: "영어" },
  { code: "ja",    name: "일본어" },
  { code: "zh-CN", name: "중국어(간체)" },
  { code: "zh-TW", name: "중국어(번체)" },
  { code: "es",    name: "스페인어" },
  { code: "pt",    name: "포르투갈어" },
  { code: "th",    name: "태국어" },
  { code: "id",    name: "인도네시아어" },
  { code: "vi",    name: "베트남어" },
  { code: "fr",    name: "프랑스어" },
];

export default function GlobalSyncPage() {
  const [showArtistSelector, setShowArtistSelector] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState<"youtube" | "upload">("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState("en");
  const [generating, setGenerating] = useState(false);
  const [subtitles, setSubtitles] = useState<SubtitleLine[]>([]);
  const [showPublish, setShowPublish] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const getYoutubeId = (url: string): string | null => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  const canProceedStep1 =
    sourceType === "youtube" ? !!getYoutubeId(youtubeUrl) : !!videoUrl;

  // YouTube IFrame API 초기화
  useEffect(() => {
    if (step !== 3 || sourceType !== "youtube" || !getYoutubeId(youtubeUrl)) return;

    const videoId = getYoutubeId(youtubeUrl)!;

    const initPlayer = () => {
      if (playerRef.current) return;
      playerRef.current = new (window as any).YT.Player("yt-player", {
        videoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            intervalRef.current = setInterval(() => {
              const t = playerRef.current?.getCurrentTime?.() ?? 0;
              setCurrentTime(t);
            }, 200);
          },
        },
      });
    };

    if ((window as any).YT?.Player) {
      initPlayer();
    } else {
      if (!document.getElementById("yt-api")) {
        const s = document.createElement("script");
        s.id = "yt-api";
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      clearInterval(intervalRef.current);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [step, sourceType, youtubeUrl]);

  // 현재 시간에 맞는 자막 하이라이트
  useEffect(() => {
    if (!subtitles.length) return;
    const idx = subtitles.findIndex((s) => {
      const start = s.startMs / 1000;
      const end = start + 3;
      return currentTime >= start && currentTime < end;
    });
    setActiveIndex(idx);
    if (idx >= 0 && listRef.current) {
      const el = listRef.current.children[idx] as HTMLElement;
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [currentTime, subtitles]);

  const handleGenerateSubtitles = useCallback(async () => {
    setGenerating(true);
    try {
      const videoId = getYoutubeId(youtubeUrl);
      if (!videoId) throw new Error("유효한 YouTube URL이 아닙니다");

      const transcriptRes = await fetch("/api/global-sync/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      const transcriptData = await transcriptRes.json();
      if (!transcriptRes.ok || !transcriptData.success) {
        alert(transcriptData.error || "자막을 가져오지 못했습니다");
        return;
      }
      if (!transcriptData.data || transcriptData.data.length === 0) {
        if (transcriptData.noCaption) {
          alert("이 영상에서 자막을 추출하지 못했습니다.\n\n원인: YouTube 자막이 비활성화되어 있거나, 자동 생성 자막도 없는 영상입니다.\n\n다른 영상을 사용하거나, 자막이 활성화된 영상을 선택해주세요.");
        } else {
          alert("자막 데이터가 비어 있습니다. 다시 시도해주세요.");
        }
        return;
      }

      const texts = transcriptData.data.map((line: SubtitleLine) => line.original);
      const translateRes = await fetch("/api/global-sync/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts, targetLang }),
      });
      const translateData = await translateRes.json();
      if (!translateRes.ok || !translateData.success) {
        alert(translateData.error || "번역에 실패했습니다");
        return;
      }

      const result: SubtitleLine[] = transcriptData.data.map(
        (line: SubtitleLine, idx: number) => ({
          ...line,
          translated: translateData.data[idx] || line.original,
        })
      );
      setSubtitles(result);
      setStep(3);
    } catch (err) {
      alert("오류: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setGenerating(false);
    }
  }, [youtubeUrl, targetLang]);

  const updateSubtitle = (id: number, field: "original" | "translated", value: string) => {
    setSubtitles((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, [field]: value } : sub))
    );
  };

  const handleRetranslateAll = async () => {
    setGenerating(true);
    try {
      const texts = subtitles.map((sub) => sub.original);
      const res = await fetch("/api/global-sync/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts, targetLang }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { alert(data.error || "재번역 실패"); return; }
      setSubtitles((prev) =>
        prev.map((sub, idx) => ({ ...sub, translated: data.data[idx] || sub.original }))
      );
    } catch (err) {
      alert("오류: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setGenerating(false);
    }
  };

  // SRT 타임스탬프 버그 수정 — startTime이 이미 HH:MM:SS,mmm 형식
  const handleDownloadSRT = () => {
    const srtContent = subtitles
      .map((sub, i) => `${i + 1}\n${sub.startTime} --> ${sub.endTime}\n${sub.translated}\n`)
      .join("\n");
    const blob = new Blob([srtContent], { type: "text/srt" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subtitles.srt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLineClick = (sub: SubtitleLine) => {
    const sec = sub.startMs / 1000;
    playerRef.current?.seekTo?.(sec, true);
    playerRef.current?.playVideo?.();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <ArtistSelector
        isOpen={showArtistSelector}
        onClose={() => setShowArtistSelector(false)}
        onSelect={(artist) => { setSelectedArtist(artist); setShowArtistSelector(false); }}
      />

      {/* 헤더 */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-black dark:text-white" />
            <div>
              <h1 className="text-lg font-bold">Global Sync</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500">자막 / 번역 스튜디오</p>
            </div>
          </div>
          {selectedArtist && (
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-full">
              <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden">
                {selectedArtist.groupImageUrl ? (
                  <Image src={selectedArtist.groupImageUrl} alt={selectedArtist.name} width={20} height={20} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <span className="text-[10px] flex items-center justify-center h-full text-gray-400">{selectedArtist.name.charAt(0)}</span>
                )}
              </div>
              <span className="text-xs text-gray-300">{selectedArtist.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 스텝 인디케이터 */}
        <div className="flex items-center gap-2 mb-8">
          {[{ num: 1, label: "영상 소스" }, { num: 2, label: "번역 설정" }, { num: 3, label: "자막 편집" }].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <button
                onClick={() => { if (s.num < step) setStep(s.num); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  step === s.num ? "bg-black text-white dark:bg-white dark:text-black"
                  : step > s.num ? "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-pointer"
                  : "bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500"
                }`}
              >
                <span>{s.num}</span><span>{s.label}</span>
              </button>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-400" />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">영상 소스 선택</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">자막을 생성할 영상을 선택하세요</p>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
              <button onClick={() => setSourceType("youtube")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${sourceType === "youtube" ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}>
                <Link className="w-4 h-4" /> YouTube URL
              </button>
              <button onClick={() => setSourceType("upload")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${sourceType === "upload" ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}>
                <Upload className="w-4 h-4" /> MP4 업로드
              </button>
            </div>
            {sourceType === "youtube" && (
              <div className="space-y-4">
                <input type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" />
                {getYoutubeId(youtubeUrl) && (
                  <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <Image src={`https://img.youtube.com/vi/${getYoutubeId(youtubeUrl)}/hqdefault.jpg`} alt="YouTube 썸네일" width={640} height={360} className="w-full h-full object-cover" unoptimized />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 truncate">{youtubeUrl}</p>
                  </div>
                )}
              </div>
            )}
            {sourceType === "upload" && (
              <FileUploader accept="video/mp4,video/*" maxMB={500} bucket="videos" onUpload={(url) => setVideoUrl(url)} label="MP4 영상을 드래그하거나 클릭해서 선택하세요" />
            )}
            <button onClick={() => setStep(2)} disabled={!canProceedStep1} className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
              다음 단계 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">번역 설정</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">번역할 언어를 선택하세요</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4">
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">원본 언어</label>
              <div className="flex items-center gap-3 bg-gray-200 dark:bg-gray-800 rounded-lg px-4 py-3">
                <span className="text-gray-900 dark:text-white font-medium">한국어</span>
                <span className="text-xs text-gray-400 ml-auto">자동 감지</span>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4">
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-3 block">번역 대상 언어</label>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button key={lang.code} onClick={() => setTargetLang(lang.code)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${targetLang === lang.code ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"}`}>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 py-2">
              <span className="bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-full text-sm text-gray-600 dark:text-gray-300">한국어</span>
              <Languages className="w-5 h-5 text-gray-400" />
              <span className="bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-full text-sm text-gray-600 dark:text-gray-300">{SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name}</span>
            </div>
            <button onClick={handleGenerateSubtitles} disabled={generating} className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-80 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              <Languages className="w-5 h-5" /> 자막 생성하기
            </button>
          </div>
        )}

        {generating && <AILoadingState estimatedSeconds={15} />}

        {/* Step 3 */}
        {step === 3 && !generating && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">자막 편집</h2>
              <div className="flex items-center gap-2">
                <button onClick={handleRetranslateAll} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <RefreshCw className="w-4 h-4" /> 전체 재번역
                </button>
                <button onClick={handleDownloadSRT} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Download className="w-4 h-4" /> SRT 다운로드
                </button>
                <button onClick={() => setShowPublish(true)} className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm hover:opacity-80 transition-all">
                  피드에 게시
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 좌측: YouTube 플레이어 */}
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                  {sourceType === "youtube" && getYoutubeId(youtubeUrl) ? (
                    <div id="yt-player" className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      비디오 미리보기
                    </div>
                  )}
                </div>
                <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">한국어</span>
                    <Languages className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">{SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">총 {subtitles.length}개 자막 라인</p>
                </div>
              </div>

              {/* 우측: 자막 라인 목록 */}
              <div ref={listRef} className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {subtitles.map((sub, i) => (
                  <div
                    key={sub.id}
                    onClick={() => handleLineClick(sub)}
                    className={`border rounded-xl p-4 space-y-3 cursor-pointer transition-all ${
                      activeIndex === i
                        ? "border-black dark:border-white bg-gray-50 dark:bg-gray-900"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{sub.startTime}</span>
                      <span>~</span>
                      <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{sub.endTime}</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">원본</label>
                      <input
                        type="text"
                        value={sub.original}
                        onChange={(e) => updateSubtitle(sub.id, "original", e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        번역 <Edit3 className="w-3 h-3" />
                      </label>
                      <input
                        type="text"
                        value={sub.translated}
                        onChange={(e) => updateSubtitle(sub.id, "translated", e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-gray-100 dark:bg-gray-800 border border-black/20 dark:border-white/20 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <PublishModal
        isOpen={showPublish}
        onClose={() => setShowPublish(false)}
        category="GLOBAL_SYNC"
        artistId={selectedArtist?.id}
        contentData={{ sourceType, youtubeUrl: sourceType === "youtube" ? youtubeUrl : undefined, videoUrl: sourceType === "upload" ? videoUrl : undefined, targetLang, subtitles }}
        thumbnailUrl={sourceType === "youtube" && getYoutubeId(youtubeUrl) ? `https://img.youtube.com/vi/${getYoutubeId(youtubeUrl)}/hqdefault.jpg` : null}
      />
    </div>
  );
}
