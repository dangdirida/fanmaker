"use client";

import { useState } from "react";
import { Sparkles, Users, Music, Star, ChevronRight, RotateCcw, Share2, Loader2, Wand2, Check } from "lucide-react";
import PublishModal from "@/components/studio/PublishModal";

const GENRES = ["K-pop", "R&B", "힙합", "인디", "일렉트로닉", "팝", "발라드", "댄스팝"];
const ACTIVITY_FORMATS = ["음악 방송", "버추얼 콘서트", "소셜 미디어", "유튜브", "팬 커뮤니티", "굿즈", "웹드라마", "버추얼 아이돌"];
const POSITIONS = ["리더", "메인 보컬", "서브 보컬", "메인 댄서", "서브 댄서", "래퍼", "비주얼", "막내", "센터", "퍼포머"];
const STEP_LABELS = ["세계관", "그룹 컨셉", "그룹 이름", "멤버 구성", "최종 프로필"];

interface WorldResult {
  title: string; summary: string; background: string;
  conflict: string; symbolism: string; keywords: string[];
}
interface NameCandidate { name: string; meaning: string; romanization: string; }
interface MemberData { name: string; positions: string[]; character: string; nationality: string; catchphrase?: string; }
interface FinalProfile {
  officialBio: string; debutConcept: string; fandomName: string;
  colorCode: string; colorName: string; slogan: string;
}

export default function IdolProjectPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Step 1
  const [wKeywords, setWKeywords] = useState("");
  const [wMood, setWMood] = useState<"bright"|"dark"|"neutral">("bright");
  const [worldResult, setWorldResult] = useState<WorldResult | null>(null);
  const [loadingWorld, setLoadingWorld] = useState(false);

  // Step 2
  const [genres, setGenres] = useState<string[]>([]);
  const [targetFandom, setTargetFandom] = useState("");
  const [activityFormats, setActivityFormats] = useState<string[]>([]);
  const [differentiation, setDifferentiation] = useState("");

  // Step 3
  const [nameCandidates, setNameCandidates] = useState<NameCandidate[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const [customName, setCustomName] = useState("");
  const [loadingNames, setLoadingNames] = useState(false);

  // Step 4
  const [memberCount, setMemberCount] = useState(4);
  const [members, setMembers] = useState<MemberData[]>(
    Array.from({length: 4}, () => ({name:"", positions:[], character:"", nationality:""}))
  );
  const [loadingMemberIdx, setLoadingMemberIdx] = useState<number|null>(null);

  // Step 5
  const [finalProfile, setFinalProfile] = useState<FinalProfile | null>(null);
  const [loadingFinal, setLoadingFinal] = useState(false);

  const groupName = customName || selectedName;

  const callApi = async (action: string, data: Record<string, unknown>) => {
    const res = await fetch("/api/ai/idol-project", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({action, data}),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "실패");
    return json.data;
  };

  const handleGenerateWorld = async () => {
    if (!wKeywords.trim()) return;
    setLoadingWorld(true);
    try {
      const result = await callApi("worldbuilding", {keywords: wKeywords, mood: wMood});
      setWorldResult(result);
    } catch (e) { alert("세계관 생성 실패: " + e); }
    finally { setLoadingWorld(false); }
  };

  const handleGenerateNames = async () => {
    setLoadingNames(true);
    try {
      const result = await callApi("names", {
        keywords: wKeywords, mood: wMood,
        worldTitle: worldResult?.title,
        genres, differentiation
      });
      setNameCandidates(result.candidates);
    } catch (e) { alert("이름 생성 실패: " + e); }
    finally { setLoadingNames(false); }
  };

  const handleAutoFillMember = async (idx: number) => {
    setLoadingMemberIdx(idx);
    try {
      const result = await callApi("member", {
        memberIndex: idx, groupName,
        worldSummary: worldResult?.summary,
        genres
      });
      setMembers(prev => {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          name: result.name || updated[idx].name,
          character: `${result.personality}\n${result.role}`,
          catchphrase: result.catchphrase,
        };
        return updated;
      });
    } catch (e) { alert("멤버 생성 실패: " + e); }
    finally { setLoadingMemberIdx(null); }
  };

  const handleGenerateFinalProfile = async () => {
    setLoadingFinal(true);
    try {
      const result = await callApi("finalProfile", {
        groupName, worldbuilding: worldResult,
        groupConcept: {genres, differentiation},
        members
      });
      setFinalProfile(result);
    } catch (e) { alert("프로필 생성 실패: " + e); }
    finally { setLoadingFinal(false); }
  };

  const handleMemberCount = (count: number) => {
    setMemberCount(count);
    setMembers(prev => Array.from({length: count}, (_, i) =>
      i < prev.length ? prev[i] : {name:"", positions:[], character:"", nationality:""}
    ));
  };

  const updateMember = (idx: number, field: keyof MemberData, value: string|string[]) => {
    setMembers(prev => { const u=[...prev]; u[idx]={...u[idx],[field]:value}; return u; });
  };

  const toggleMemberPos = (idx: number, pos: string) => {
    const cur = members[idx].positions;
    updateMember(idx, "positions", cur.includes(pos) ? cur.filter(p=>p!==pos) : [...cur, pos]);
  };

  const renderStep = () => {
    switch(currentStep) {

      // ── Step 1: 세계관 ──
      case 0: return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">세계관 설정</h2>
              <p className="text-xs text-gray-400">그룹의 스토리 세계관을 AI로 생성해요</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">키워드 *</label>
            <textarea
              value={wKeywords}
              onChange={e => setWKeywords(e.target.value)}
              placeholder="예: 우주, 별, 꿈, 시간여행, 마법, 빛과 어둠..."
              className="w-full h-28 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">분위기</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {key:"bright" as const, emoji:"", label:"밝은", desc:"희망적·청량"},
                {key:"dark" as const, emoji:"", label:"어두운", desc:"신비·강렬"},
                {key:"neutral" as const, emoji:"", label:"중립", desc:"균형·다양"},
              ].map(m => (
                <button key={m.key} onClick={() => setWMood(m.key)}
                  className={`flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all ${wMood===m.key ? "border-black bg-black text-white" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className={`text-sm font-bold ${wMood===m.key?"text-white":"text-gray-900 dark:text-white"}`}>{m.label}</span>
                  <span className={`text-xs ${wMood===m.key?"text-gray-300":"text-gray-400"}`}>{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerateWorld} disabled={!wKeywords.trim() || loadingWorld}
            className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all"
          >
            {loadingWorld ? <><Loader2 className="w-5 h-5 animate-spin"/>세계관 생성 중...</> : <><Wand2 className="w-5 h-5"/>AI로 세계관 생성하기</>}
          </button>

          {worldResult && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 rounded-2xl p-5 border border-purple-200 dark:border-purple-800 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-lg"></span>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">{worldResult.title}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{worldResult.summary}</p>
              <div className="bg-white/60 dark:bg-gray-900/60 rounded-xl p-4">
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">배경</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{worldResult.background}</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/60 rounded-xl p-4">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">중심 갈등</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{worldResult.conflict}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {worldResult.keywords.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium">{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      );

      // ── Step 2: 그룹 컨셉 ──
      case 1: return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">그룹 컨셉</h2>
              <p className="text-xs text-gray-400">음악 장르, 팬덤, 활동 방식을 설정해요</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">장르 (복수 선택)</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button key={g} onClick={() => setGenres(prev => prev.includes(g)?prev.filter(x=>x!==g):[...prev,g])}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${genres.includes(g)?"border-black bg-black text-white":"border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"}`}
                >{g}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">타겟 팬덤</label>
            <input value={targetFandom} onChange={e=>setTargetFandom(e.target.value)}
              placeholder="예: 10~20대 글로벌 K-pop 팬..."
              className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">활동 형태</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_FORMATS.map(f => (
                <button key={f} onClick={() => setActivityFormats(prev => prev.includes(f)?prev.filter(x=>x!==f):[...prev,f])}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${activityFormats.includes(f)?"border-pink-500 bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300":"border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}
                >{activityFormats.includes(f) ? " " : ""}{f}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">차별화 포인트</label>
            <textarea value={differentiation} onChange={e=>setDifferentiation(e.target.value)}
              placeholder="이 그룹만의 독특한 매력이나 차별점을 작성하세요..."
              className="w-full h-24 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 resize-none transition-colors"
            />
          </div>
        </div>
      );

      // ── Step 3: 그룹 이름 ──
      case 2: return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">그룹 이름</h2>
              <p className="text-xs text-gray-400">세계관과 컨셉을 기반으로 AI가 이름을 제안해요</p>
            </div>
          </div>

          <button onClick={handleGenerateNames} disabled={loadingNames}
            className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
          >
            {loadingNames ? <><Loader2 className="w-5 h-5 animate-spin"/>이름 생성 중...</> : <><Wand2 className="w-5 h-5"/>AI 이름 후보 생성</>}
          </button>

          {nameCandidates.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {nameCandidates.map((c, i) => (
                <button key={i} onClick={() => {setSelectedName(c.name); setCustomName("");}}
                  className={`p-4 rounded-2xl text-left transition-all ${selectedName===c.name ? "border-2 border-black bg-black/5 dark:bg-white/5" : "border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-extrabold text-gray-900 dark:text-white text-lg">{c.name}</p>
                    {selectedName===c.name && <Check className="w-4 h-4 text-black dark:text-white" />}
                  </div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">{c.romanization}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{c.meaning}</p>
                </button>
              ))}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">직접 입력</label>
            <input value={customName} onChange={e=>{setCustomName(e.target.value); setSelectedName("");}}
              placeholder="원하는 그룹명을 직접 입력하세요..."
              className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {groupName && (
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-2xl border-2 border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-widest mb-2">Selected Name</p>
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{groupName}</p>
            </div>
          )}
        </div>
      );

      // ── Step 4: 멤버 구성 ──
      case 3: return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">멤버 구성</h2>
              <p className="text-xs text-gray-400">AI가 멤버 캐릭터를 자동으로 채워줄 수 있어요</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              멤버 수: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{memberCount}명</span>
            </label>
            <input type="range" min={2} max={9} value={memberCount} onChange={e=>handleMemberCount(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>2명</span><span>9명</span></div>
          </div>

          <div className="space-y-4">
            {members.map((m, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">{i+1}</div>
                    <h3 className="font-bold text-gray-900 dark:text-white">멤버 {i+1}{m.name ? ` — ${m.name}` : ""}</h3>
                  </div>
                  <button onClick={() => handleAutoFillMember(i)} disabled={!groupName || loadingMemberIdx===i}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold hover:bg-emerald-100 disabled:opacity-40 transition-colors"
                  >
                    {loadingMemberIdx===i ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Wand2 className="w-3.5 h-3.5"/>}
                    AI 자동완성
                  </button>
                </div>

                {m.catchphrase && (
                  <div className="bg-emerald-50 dark:bg-emerald-950 rounded-xl px-3 py-2">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">&quot;{m.catchphrase}&quot;</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">이름</label>
                    <input value={m.name} onChange={e=>updateMember(i,"name",e.target.value)}
                      placeholder="멤버 이름"
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">국적</label>
                    <input value={m.nationality} onChange={e=>updateMember(i,"nationality",e.target.value)}
                      placeholder="예: 한국, 일본..."
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-2 block">포지션</label>
                  <div className="flex flex-wrap gap-1.5">
                    {POSITIONS.map(pos => (
                      <button key={pos} onClick={() => toggleMemberPos(i, pos)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${m.positions.includes(pos)?"bg-emerald-500 text-white":"bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
                      >{pos}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">캐릭터 설명</label>
                  <textarea value={m.character} onChange={e=>updateMember(i,"character",e.target.value)}
                    placeholder="AI 자동완성 또는 직접 입력..."
                    className="w-full h-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      // ── Step 5: 최종 프로필 ──
      case 4: return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">최종 프로필 생성</h2>
              <p className="text-xs text-gray-400">AI가 공식 프로필과 팬덤 정보를 만들어줘요</p>
            </div>
          </div>

          {!finalProfile ? (
            <button onClick={handleGenerateFinalProfile} disabled={loadingFinal || !groupName}
              className="w-full py-5 rounded-2xl font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              {loadingFinal ? <><Loader2 className="w-5 h-5 animate-spin"/>프로필 생성 중...</> : <><Wand2 className="w-5 h-5"/>AI 최종 프로필 생성하기</>}
            </button>
          ) : (
            <div className="space-y-4">
              {/* 그룹 정체성 카드 */}
              <div className="rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-800">
                <div className="h-3" style={{backgroundColor: finalProfile.colorCode}} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{color: finalProfile.colorCode}}>Official Profile</p>
                      <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{groupName}</h3>
                      <p className="text-sm text-gray-500 mt-1 italic">&quot;{finalProfile.slogan}&quot;</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="w-10 h-10 rounded-xl shadow-lg" style={{backgroundColor: finalProfile.colorCode}} />
                      <p className="text-xs text-gray-400">{finalProfile.colorName}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{finalProfile.officialBio}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">데뷔 컨셉</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{finalProfile.debutConcept}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">팬덤</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{finalProfile.fandomName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 멤버 카드 그리드 */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">멤버 라인업</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {members.map((m, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
                      <div className="w-10 h-10 rounded-full mb-2 flex items-center justify-center font-extrabold text-white text-sm" style={{backgroundColor: finalProfile.colorCode}}>
                        {m.name ? m.name[0] : String(i+1)}
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{m.name || `멤버 ${i+1}`}</p>
                      {m.nationality && <p className="text-xs text-gray-400">{m.nationality}</p>}
                      {m.positions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {m.positions.slice(0,2).map(p => (
                            <span key={p} className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{backgroundColor: finalProfile.colorCode}}>{p}</span>
                          ))}
                        </div>
                      )}
                      {m.catchphrase && <p className="text-xs text-gray-400 mt-2 italic">&quot;{m.catchphrase}&quot;</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setFinalProfile(null)}
                  className="flex items-center gap-1.5 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4"/> 다시 생성
                </button>
                <button onClick={() => setShowPublishModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                >
                  <Share2 className="w-4 h-4"/> 피드에 게시하기
                </button>
              </div>
            </div>
          )}
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">아이돌 프로젝트</h1>
            <p className="text-sm text-gray-400">나만의 아이돌 그룹을 기획하세요</p>
          </div>
        </div>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <button onClick={() => setCurrentStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                currentStep===i ? "bg-black text-white" : i < currentStep ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300" : "text-gray-400"
              }`}
            >
              {i < currentStep ? <Check className="w-3 h-3"/> : <span>{i+1}</span>}
              {label}
            </button>
            {i < STEP_LABELS.length-1 && <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0"/>}
          </div>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        {renderStep()}
      </div>

      {/* 이전/다음 */}
      <div className="flex justify-between">
        <button onClick={() => setCurrentStep(s => Math.max(0,s-1))} disabled={currentStep===0}
          className="px-6 py-3 rounded-xl font-medium text-gray-500 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 disabled:opacity-30 transition-colors"
        >이전</button>
        <button onClick={() => setCurrentStep(s => Math.min(STEP_LABELS.length-1, s+1))}
          className="px-6 py-3 rounded-xl font-bold text-white bg-black hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          {currentStep === STEP_LABELS.length-1 ? "완료" : "다음"} <ChevronRight className="w-4 h-4"/>
        </button>
      </div>

      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        category="IDOL_PROJECT"
        contentData={{
          groupName, worldbuilding: worldResult,
          groupConcept: {genres, targetFandom, activityFormats, differentiation},
          members, finalProfile
        }}
      />
    </div>
  );
}
