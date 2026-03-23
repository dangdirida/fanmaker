"use client";

import { useState } from "react";
import { Sparkles, Music, Palette, Mic, ChevronRight, RotateCcw, Share2, Download, Check } from "lucide-react";
import PublishModal from "@/components/studio/PublishModal";

const MOODS = [
  { key: "다크판타지", emoji: "", desc: "어둡고 신비로운" },
  { key: "청량", emoji: "", desc: "시원하고 상쾌한" },
  { key: "로맨틱", emoji: "", desc: "달콤하고 감성적인" },
  { key: "파워풀", emoji: "", desc: "강렬하고 에너지 넘치는" },
  { key: "사이버펑크", emoji: "", desc: "미래적이고 실험적인" },
  { key: "자연/힐링", emoji: "", desc: "따뜻하고 포근한" },
  { key: "레트로", emoji: "", desc: "80-90s 감성" },
  { key: "몽환", emoji: "", desc: "꿈결같이 흐릿한" },
];

const AUDIENCES = ["10대 팬덤", "20대 글로벌", "전연령 대중", "코어 팬덤", "해외 타겟"];

type Track = { title: string; mood: string; description: string };
type ConceptResult = {
  albumTitle: string;
  titleTrack: string;
  concept: string;
  tagline: string;
  tracks: Track[];
  palette: string[];
  visualDirection: string;
  styling: string;
  stageDirection: string;
  moodKeywords: string[];
  coverStyle: string;
};

// 앨범 커버 SVG 생성
function AlbumCover({ result, primaryColor }: { result: ConceptResult; primaryColor: string }) {
  const colors = result.palette;
  const c1 = colors[0] || primaryColor;
  const c2 = colors[1] || "#ffffff";
  const c3 = colors[2] || "#888888";

  return (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="50%" stopColor={c2} stopOpacity="0.3" />
          <stop offset="100%" stopColor={c3} stopOpacity="0.8" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="40%">
          <stop offset="0%" stopColor={c2} stopOpacity="0.4" />
          <stop offset="100%" stopColor={c1} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* 배경 */}
      <rect width="400" height="400" fill="url(#bg)" />
      {/* 글로우 원 */}
      <circle cx="200" cy="160" r="120" fill="url(#glow)" />
      {/* 장식 원들 */}
      <circle cx="200" cy="160" r="90" fill="none" stroke={c2} strokeWidth="1" strokeOpacity="0.3" />
      <circle cx="200" cy="160" r="65" fill="none" stroke={c2} strokeWidth="0.5" strokeOpacity="0.2" />
      {/* 빛 줄기 */}
      {[0,45,90,135,180,225,270,315].map((angle, i) => (
        <line
          key={i}
          x1="200" y1="160"
          x2={200 + 110 * Math.cos(angle * Math.PI / 180)}
          y2={160 + 110 * Math.sin(angle * Math.PI / 180)}
          stroke={c2} strokeWidth="0.5" strokeOpacity="0.2"
        />
      ))}
      {/* 앨범 타이틀 */}
      <text x="200" y="300" textAnchor="middle" fill={c2} fontSize="14" fontWeight="bold" letterSpacing="6" opacity="0.9">
        {result.albumTitle.substring(0, 16).toUpperCase()}
      </text>
      {/* 태그라인 */}
      <text x="200" y="330" textAnchor="middle" fill={c2} fontSize="9" letterSpacing="3" opacity="0.6">
        {result.tagline}
      </text>
      {/* 하단 선 */}
      <line x1="140" y1="315" x2="260" y2="315" stroke={c2} strokeWidth="0.5" strokeOpacity="0.4" />
      {/* 코너 장식 */}
      <rect x="20" y="20" width="20" height="2" fill={c2} opacity="0.4" />
      <rect x="20" y="20" width="2" height="20" fill={c2} opacity="0.4" />
      <rect x="360" y="20" width="20" height="2" fill={c2} opacity="0.4" />
      <rect x="378" y="20" width="2" height="20" fill={c2} opacity="0.4" />
      <rect x="20" y="378" width="20" height="2" fill={c2} opacity="0.4" />
      <rect x="20" y="360" width="2" height="20" fill={c2} opacity="0.4" />
      <rect x="360" y="378" width="20" height="2" fill={c2} opacity="0.4" />
      <rect x="378" y="360" width="2" height="20" fill={c2} opacity="0.4" />
    </svg>
  );
}

export default function ConceptStudioPage() {
  const [step, setStep] = useState(1);
  const [artistName, setArtistName] = useState("");
  const [mood, setMood] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [albumName, setAlbumName] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<ConceptResult | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "tracks" | "visual" | "staging">("overview");
  const [showPublish, setShowPublish] = useState(false);
  const [copied, setCopied] = useState(false);

  const addKeyword = (kw?: string) => {
    const k = kw || keywordInput.trim();
    if (k && keywords.length < 6 && !keywords.includes(k)) {
      setKeywords([...keywords, k]);
      setKeywordInput("");
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/concept/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistName, mood, keywords, primaryColor, albumName, targetAudience }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setStep(4);
      } else {
        alert("생성 실패. 다시 시도해주세요.");
      }
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = ` ${result.albumTitle}\n 타이틀: ${result.titleTrack}\n\n${result.concept}\n\n트랙리스트:\n${result.tracks.map((t,i)=>`${i+1}. ${t.title}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setStep(1); setResult(null); setArtistName(""); setMood(""); setKeywords([]); setAlbumName(""); setTargetAudience(""); setPrimaryColor("#6366f1"); };

  // 로딩
  if (generating) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="relative mx-auto w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900" />
        <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">컨셉 키트 생성 중...</h2>
      <p className="text-gray-500 text-sm">AI가 {artistName}의 컨셉을 분석하고 있어요</p>
      <div className="mt-6 flex flex-wrap justify-center gap-1">
        {["트랙리스트 구성", "비주얼 방향성", "컬러 팔레트", "스타일링 가이드"].map((t, i) => (
          <div key={i} className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 dark:bg-purple-950 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            <span className="text-xs text-purple-600 dark:text-purple-400">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // 결과
  if (result) return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-widest mb-1">Concept Kit Complete</p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{result.albumTitle}</h1>
          <p className="text-gray-500 text-sm mt-1">{result.tagline}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Download className="w-4 h-4" />}
            {copied ? "복사됨!" : "복사"}
          </button>
          <button onClick={reset} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RotateCcw className="w-4 h-4" /> 다시
          </button>
          <button onClick={() => setShowPublish(true)} className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-xl text-sm hover:bg-gray-800 transition-colors">
            <Share2 className="w-4 h-4" /> 게시
          </button>
        </div>
      </div>

      {/* 앨범 커버 + 기본 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 앨범 커버 */}
        <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
          <AlbumCover result={result} primaryColor={primaryColor} />
        </div>

        {/* 기본 정보 */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">타이틀 트랙</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white"> {result.titleTrack}</p>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">컨셉</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{result.concept}</p>
            </div>
            {/* 무드 키워드 */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">무드 키워드</p>
              <div className="flex flex-wrap gap-1.5">
                {result.moodKeywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: result.palette[i % result.palette.length] || "#6366f1" }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            {/* 팔레트 */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">컬러 팔레트</p>
              <div className="flex gap-2">
                {result.palette.map((color, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl shadow-md border border-gray-200 dark:border-gray-700" style={{ backgroundColor: color }} />
                    <span className="text-[9px] text-gray-400 font-mono">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
        {([
          { key: "overview", label: "개요", icon: Sparkles },
          { key: "tracks", label: "트랙리스트", icon: Music },
          { key: "visual", label: "비주얼", icon: Palette },
          { key: "staging", label: "무대/스타일링", icon: Mic },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === key ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white">컨셉 오버뷰</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{result.concept}</p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">아티스트</p>
                <p className="font-bold text-gray-900 dark:text-white">{artistName}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">무드</p>
                <p className="font-bold text-gray-900 dark:text-white">{mood}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">타이틀</p>
                <p className="font-bold text-gray-900 dark:text-white">{result.titleTrack}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">수록곡</p>
                <p className="font-bold text-gray-900 dark:text-white">{result.tracks.length}곡</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === "tracks" && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">트랙리스트</h3>
            {result.tracks.map((track, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: result.palette[i % result.palette.length] || "#6366f1" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 dark:text-white">{track.title}</p>
                    {i === 0 && <span className="px-1.5 py-0.5 bg-black text-white text-[9px] rounded font-bold">TITLE</span>}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{track.mood}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{track.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "visual" && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white">비주얼 방향성</h3>
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{result.visualDirection}</p>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white pt-2">앨범 커버 스타일</h3>
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{result.coverStyle}</p>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white pt-2">컬러 팔레트 상세</h3>
            <div className="grid grid-cols-5 gap-3">
              {result.palette.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-full aspect-square rounded-xl shadow-lg" style={{ backgroundColor: color }} />
                  <span className="text-xs text-gray-500 font-mono">{color}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "staging" && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white">스타일링 가이드</h3>
            <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 rounded-xl">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{result.styling}</p>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white pt-2">무대 연출</h3>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{result.stageDirection}</p>
            </div>
          </div>
        )}
      </div>

      <PublishModal
        isOpen={showPublish}
        onClose={() => setShowPublish(false)}
        category="CONCEPT"
        contentData={result}
        thumbnailUrl={null}
      />
    </div>
  );

  // 입력 폼 (3 step)
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">컨셉 스튜디오</h1>
        </div>
        <p className="text-gray-500 text-sm">AI가 K-pop 컨셉 키트를 완성해드려요</p>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-black text-white" : "bg-gray-100 text-gray-400"}`}>
              {step > s ? <Check className="w-3.5 h-3.5" /> : s}
            </div>
            <span className={`text-xs font-medium ${step >= s ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
              {["아티스트", "무드 & 키워드", "세부 설정"][s - 1]}
            </span>
            {s < 3 && <ChevronRight className="w-3 h-3 text-gray-300" />}
          </div>
        ))}
      </div>

      {/* Step 1: 아티스트 */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">아티스트/그룹명 *</label>
            <input
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && artistName && setStep(2)}
              placeholder="예: aespa, BTS, 뉴진스..."
              className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!artistName.trim()}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-gray-800 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            다음 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: 무드 & 키워드 */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">컨셉 무드 *</label>
            <div className="grid grid-cols-2 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMood(m.key)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${mood === m.key ? "border-black bg-black text-white" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <div>
                    <p className={`text-sm font-bold ${mood === m.key ? "text-white" : "text-gray-900 dark:text-white"}`}>{m.key}</p>
                    <p className={`text-xs ${mood === m.key ? "text-gray-300" : "text-gray-400"}`}>{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">키워드 태그 <span className="text-gray-400 font-normal">(최대 6개)</span></label>
            <div className="flex flex-wrap gap-2 mb-3">
              {keywords.map((kw, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  {kw}
                  <button onClick={() => setKeywords(keywords.filter((_, j) => j !== i))} className="text-purple-400 hover:text-purple-600">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                placeholder="키워드 입력 후 Enter"
                className="flex-1 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button onClick={() => addKeyword()} className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">추가</button>
            </div>
            {/* 추천 키워드 */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["미래지향", "청순", "강렬", "감성", "화려함", "신비", "파격", "따뜻함"].filter(k => !keywords.includes(k)).slice(0, 5).map(k => (
                <button key={k} onClick={() => addKeyword(k)} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs rounded-full hover:bg-gray-200 transition-colors">+ {k}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">이전</button>
            <button onClick={() => setStep(3)} disabled={!mood} className="flex-1 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
              다음 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: 세부 설정 */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">앨범/타이틀 방향 <span className="text-gray-400 font-normal">(선택)</span></label>
            <input
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              placeholder="예: 봄의 시작, NOVA, 에코..."
              className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">타겟 오디언스 <span className="text-gray-400 font-normal">(선택)</span></label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((a) => (
                <button key={a} onClick={() => setTargetAudience(targetAudience === a ? "" : a)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${targetAudience === a ? "border-black bg-black text-white" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">대표 색상</label>
            <div className="flex items-center gap-4">
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-14 h-14 rounded-2xl border-2 border-gray-200 cursor-pointer bg-transparent"
              />
              <div className="flex gap-2">
                {["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#000000"].map(c => (
                  <button key={c} onClick={() => setPrimaryColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${primaryColor === c ? "border-gray-900 scale-110" : "border-transparent hover:scale-105"}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
          {/* 요약 */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">생성 요약</p>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-400">아티스트:</span> <span className="font-medium text-gray-900 dark:text-white">{artistName}</span></p>
              <p><span className="text-gray-400">무드:</span> <span className="font-medium text-gray-900 dark:text-white">{mood}</span></p>
              {keywords.length > 0 && <p><span className="text-gray-400">키워드:</span> <span className="font-medium text-gray-900 dark:text-white">{keywords.join(", ")}</span></p>}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="px-6 py-4 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">이전</button>
            <button
              onClick={handleGenerate}
              className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-sm hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
            >
              <Sparkles className="w-5 h-5" />
              AI 컨셉 키트 생성하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
