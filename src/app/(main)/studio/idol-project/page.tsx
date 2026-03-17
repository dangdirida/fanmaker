"use client";

import { useState } from "react";
import PublishModal from "@/components/studio/PublishModal";

// ── 타입 정의 ──────────────────────────────────────────
interface WorldbuildingData {
  keywords: string;
  mood: "bright" | "dark" | "neutral";
}

interface GroupConceptData {
  genres: string[];
  targetFandom: string;
  activityFormats: string[];
  differentiation: string;
}

interface NameCandidate {
  name: string;
  meaning: string;
  romanization: string;
}

interface GroupNameData {
  candidates: NameCandidate[];
  selected: string;
  custom: string;
}

interface MemberData {
  name: string;
  positions: string[];
  character: string;
  nationality: string;
}

interface MembersData {
  count: number;
  members: MemberData[];
}

interface VisualData {
  skipped: boolean;
}

// ── 상수 ────────────────────────────────────────────────
const GENRES = ["K-pop", "R&B", "Hip-hop", "Indie", "Electronic", "Pop"];
const ACTIVITY_FORMATS = [
  "음악 방송",
  "버추얼 콘서트",
  "소셜 미디어",
  "유튜브",
  "팬 커뮤니티",
  "굿즈",
];
const POSITIONS = [
  "리더",
  "메인 보컬",
  "서브 보컬",
  "메인 댄서",
  "서브 댄서",
  "래퍼",
  "비주얼",
  "막내",
];
const STEP_LABELS = [
  "세계관 설정",
  "그룹 컨셉",
  "그룹 이름",
  "멤버 구성",
  "비주얼",
];

// ── 메인 컴포넌트 ────────────────────────────────────────
export default function IdolProjectPage() {
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1 — 세계관
  const [worldbuilding, setWorldbuilding] = useState<WorldbuildingData>({
    keywords: "",
    mood: "bright",
  });
  const [worldbuildingResult, setWorldbuildingResult] = useState<string>("");
  const [isGeneratingWorld, setIsGeneratingWorld] = useState(false);

  // Step 2 — 그룹 컨셉
  const [groupConcept, setGroupConcept] = useState<GroupConceptData>({
    genres: [],
    targetFandom: "",
    activityFormats: [],
    differentiation: "",
  });

  // Step 3 — 그룹 이름
  const [groupName, setGroupName] = useState<GroupNameData>({
    candidates: [],
    selected: "",
    custom: "",
  });
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);

  // Step 4 — 멤버
  const [membersData, setMembersData] = useState<MembersData>({
    count: 4,
    members: Array.from({ length: 4 }, () => ({
      name: "",
      positions: [],
      character: "",
      nationality: "",
    })),
  });

  // Step 5 — 비주얼
  const [, setVisualData] = useState<VisualData>({ skipped: false });

  // 발행 모달
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // ── 핸들러 ──────────────────────────────────────────────
  const handleGenerateWorldbuilding = async () => {
    setIsGeneratingWorld(true);
    try {
      // TODO: AI API 호출
      await new Promise((r) => setTimeout(r, 1500));
      setWorldbuildingResult(
        `키워드 "${worldbuilding.keywords}"와 ${worldbuilding.mood === "bright" ? "밝은" : worldbuilding.mood === "dark" ? "어두운" : "중립적인"} 분위기를 바탕으로 생성된 세계관입니다.\n\n이 그룹은 빛과 그림자의 경계에서 탄생한 존재들로, 각각 고유한 능력을 가진 멤버들이 모여 세상의 균형을 지키는 이야기를 담고 있습니다.`
      );
    } finally {
      setIsGeneratingWorld(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setGroupConcept((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const toggleActivityFormat = (format: string) => {
    setGroupConcept((prev) => ({
      ...prev,
      activityFormats: prev.activityFormats.includes(format)
        ? prev.activityFormats.filter((f) => f !== format)
        : [...prev.activityFormats, format],
    }));
  };

  const handleGenerateNames = async () => {
    setIsGeneratingNames(true);
    try {
      // TODO: AI API 호출
      await new Promise((r) => setTimeout(r, 1500));
      const mockCandidates: NameCandidate[] = [
        { name: "루미나", meaning: "빛을 밝히는 자들", romanization: "LUMINA" },
        { name: "에테르", meaning: "순수한 본질", romanization: "AETHER" },
        { name: "프리즘", meaning: "다채로운 빛의 조각", romanization: "PRISM" },
        { name: "노바", meaning: "새로운 별의 탄생", romanization: "NOVA" },
        { name: "아우라", meaning: "빛나는 기운", romanization: "AURA" },
        { name: "셀레스", meaning: "천상의 존재", romanization: "CELESTE" },
        { name: "미라쥬", meaning: "환상의 세계", romanization: "MIRAGE" },
        { name: "엘리시아", meaning: "이상향의 수호자", romanization: "ELYSIA" },
        { name: "크로노스", meaning: "시간의 지배자", romanization: "CHRONOS" },
        { name: "네뷸라", meaning: "우주의 시작", romanization: "NEBULA" },
      ];
      setGroupName((prev) => ({ ...prev, candidates: mockCandidates }));
    } finally {
      setIsGeneratingNames(false);
    }
  };

  const handleMemberCountChange = (count: number) => {
    setMembersData((prev) => {
      const newMembers = Array.from({ length: count }, (_, i) =>
        i < prev.members.length
          ? prev.members[i]
          : { name: "", positions: [], character: "", nationality: "" }
      );
      return { count, members: newMembers };
    });
  };

  const updateMember = (index: number, field: keyof MemberData, value: string | string[]) => {
    setMembersData((prev) => {
      const updated = [...prev.members];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, members: updated };
    });
  };

  const toggleMemberPosition = (memberIndex: number, position: string) => {
    const current = membersData.members[memberIndex].positions;
    const next = current.includes(position)
      ? current.filter((p) => p !== position)
      : [...current, position];
    updateMember(memberIndex, "positions", next);
  };

  const finalGroupName = groupName.custom || groupName.selected;

  const handleDownloadPDF = () => {
    // TODO: PDF 생성 로직
    alert("PDF 다운로드 기능은 추후 구현 예정입니다.");
  };

  // ── 스텝 렌더링 ─────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {
      // ── Step 1: 세계관 설정 ──
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">세계관 설정</h2>
            <p className="text-gray-500 dark:text-gray-400">
              아이돌 그룹의 세계관을 만들어보세요. 키워드와 분위기를 입력하면 AI가 세계관을 생성합니다.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                키워드 (콤마로 구분)
              </label>
              <textarea
                value={worldbuilding.keywords}
                onChange={(e) =>
                  setWorldbuilding((prev) => ({ ...prev, keywords: e.target.value }))
                }
                placeholder="예: 우주, 별, 꿈, 시간여행, 마법..."
                className="w-full h-32 bg-gray-100 dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#ff3d7f] focus:ring-1 focus:ring-[#ff3d7f] outline-none resize-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">분위기</label>
              <div className="flex gap-3">
                {(["bright", "dark", "neutral"] as const).map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setWorldbuilding((prev) => ({ ...prev, mood }))}
                    className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                      worldbuilding.mood === mood
                        ? "bg-[#ff3d7f] text-white shadow-lg shadow-[#ff3d7f]/25"
                        : "bg-gray-100 dark:bg-[#1a1a2e] text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                  >
                    {mood === "bright" ? "밝은" : mood === "dark" ? "어두운" : "중립"}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateWorldbuilding}
              disabled={!worldbuilding.keywords.trim() || isGeneratingWorld}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#ff3d7f] to-[#c084fc] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {isGeneratingWorld ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI 세계관 생성 중...
                </span>
              ) : (
                "AI로 세계관 생성하기"
              )}
            </button>

            {worldbuildingResult && (
              <div className="bg-gray-100 dark:bg-[#1a1a2e] border border-[#c084fc]/30 rounded-xl p-5">
                <h3 className="text-[#c084fc] font-semibold mb-2">생성된 세계관</h3>
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                  {worldbuildingResult}
                </p>
              </div>
            )}
          </div>
        );

      // ── Step 2: 그룹 컨셉 ──
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">그룹 컨셉</h2>
            <p className="text-gray-500 dark:text-gray-400">그룹의 음악 장르, 팬덤, 활동 형태를 설정하세요.</p>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                장르 (복수 선택 가능)
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      groupConcept.genres.includes(genre)
                        ? "bg-[#ff3d7f] text-white shadow-lg shadow-[#ff3d7f]/25"
                        : "bg-gray-100 dark:bg-[#1a1a2e] text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">타겟 팬덤</label>
              <input
                type="text"
                value={groupConcept.targetFandom}
                onChange={(e) =>
                  setGroupConcept((prev) => ({ ...prev, targetFandom: e.target.value }))
                }
                placeholder="예: 10~20대 여성, 글로벌 K-pop 팬..."
                className="w-full bg-gray-100 dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#ff3d7f] focus:ring-1 focus:ring-[#ff3d7f] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                활동 형태 (복수 선택 가능)
              </label>
              <div className="flex flex-wrap gap-2">
                {ACTIVITY_FORMATS.map((format) => (
                  <label
                    key={format}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                      groupConcept.activityFormats.includes(format)
                        ? "bg-[#c084fc]/20 text-[#c084fc] border border-[#c084fc]/40"
                        : "bg-gray-100 dark:bg-[#1a1a2e] text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={groupConcept.activityFormats.includes(format)}
                      onChange={() => toggleActivityFormat(format)}
                      className="sr-only"
                    />
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        groupConcept.activityFormats.includes(format)
                          ? "bg-[#c084fc] border-[#c084fc]"
                          : "border-gray-600"
                      }`}
                    >
                      {groupConcept.activityFormats.includes(format) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    {format}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                차별화 포인트
              </label>
              <textarea
                value={groupConcept.differentiation}
                onChange={(e) =>
                  setGroupConcept((prev) => ({ ...prev, differentiation: e.target.value }))
                }
                placeholder="이 그룹만의 독특한 매력이나 차별점을 작성하세요..."
                className="w-full h-28 bg-gray-100 dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#ff3d7f] focus:ring-1 focus:ring-[#ff3d7f] outline-none resize-none transition-colors"
              />
            </div>
          </div>
        );

      // ── Step 3: 그룹 이름 ──
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">그룹 이름</h2>
            <p className="text-gray-500 dark:text-gray-400">
              AI가 세계관과 컨셉을 기반으로 이름 후보를 제안합니다.
            </p>

            <button
              onClick={handleGenerateNames}
              disabled={isGeneratingNames}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#ff3d7f] to-[#c084fc] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {isGeneratingNames ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  이름 후보 생성 중...
                </span>
              ) : (
                "AI로 이름 후보 생성하기"
              )}
            </button>

            {groupName.candidates.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {groupName.candidates.map((candidate, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setGroupName((prev) => ({
                        ...prev,
                        selected: candidate.name,
                        custom: "",
                      }))
                    }
                    className={`p-4 rounded-xl text-left transition-all ${
                      groupName.selected === candidate.name
                        ? "bg-[#ff3d7f]/20 border-2 border-[#ff3d7f] shadow-lg shadow-[#ff3d7f]/10"
                        : "bg-gray-100 dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                  >
                    <p className="text-gray-900 dark:text-white font-bold text-lg">{candidate.name}</p>
                    <p className="text-[#c084fc] text-xs font-medium mt-1">
                      {candidate.romanization}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">{candidate.meaning}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                또는 직접 입력
              </label>
              <input
                type="text"
                value={groupName.custom}
                onChange={(e) =>
                  setGroupName((prev) => ({ ...prev, custom: e.target.value, selected: "" }))
                }
                placeholder="원하는 그룹명을 직접 입력하세요..."
                className="w-full bg-gray-100 dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#ff3d7f] focus:ring-1 focus:ring-[#ff3d7f] outline-none transition-colors"
              />
            </div>

            {finalGroupName && (
              <div className="bg-gray-100 dark:bg-[#1a1a2e] border border-[#ff3d7f]/30 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">선택된 이름</p>
                <p className="text-[#ff3d7f] text-2xl font-bold mt-1">{finalGroupName}</p>
              </div>
            )}
          </div>
        );

      // ── Step 4: 멤버 구성 ──
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">멤버 구성</h2>
            <p className="text-gray-500 dark:text-gray-400">그룹 멤버의 이름, 포지션, 캐릭터를 설정하세요.</p>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                멤버 수: <span className="text-[#ff3d7f] font-bold">{membersData.count}명</span>
              </label>
              <input
                type="range"
                min={2}
                max={9}
                value={membersData.count}
                onChange={(e) => handleMemberCountChange(Number(e.target.value))}
                className="w-full accent-[#ff3d7f]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>2명</span>
                <span>9명</span>
              </div>
            </div>

            <div className="space-y-4">
              {membersData.members.map((member, i) => (
                <div
                  key={i}
                  className="bg-gray-100 dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-700 rounded-xl p-5 space-y-4"
                >
                  <h3 className="text-[#c084fc] font-semibold">멤버 {i + 1}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">이름</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateMember(i, "name", e.target.value)}
                        placeholder="멤버 이름"
                        className="w-full bg-gray-50 dark:bg-[#0f0f23] border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#ff3d7f] focus:ring-1 focus:ring-[#ff3d7f] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">국적</label>
                      <input
                        type="text"
                        value={member.nationality}
                        onChange={(e) => updateMember(i, "nationality", e.target.value)}
                        placeholder="예: 한국, 일본, 미국..."
                        className="w-full bg-gray-50 dark:bg-[#0f0f23] border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#ff3d7f] focus:ring-1 focus:ring-[#ff3d7f] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      포지션 (복수 선택)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {POSITIONS.map((pos) => (
                        <button
                          key={pos}
                          onClick={() => toggleMemberPosition(i, pos)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                            member.positions.includes(pos)
                              ? "bg-[#c084fc] text-white"
                              : "bg-gray-50 dark:bg-[#0f0f23] text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">캐릭터 설명</label>
                    <textarea
                      value={member.character}
                      onChange={(e) => updateMember(i, "character", e.target.value)}
                      placeholder="이 멤버의 성격, 특징, 세계관 내 역할 등..."
                      className="w-full h-20 bg-gray-50 dark:bg-[#0f0f23] border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#ff3d7f] focus:ring-1 focus:ring-[#ff3d7f] outline-none resize-none transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // ── Step 5: 비주얼 (선택) ──
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">비주얼 설정</h2>
            <p className="text-gray-500 dark:text-gray-400">
              그룹의 비주얼 컨셉을 설정하세요. 이 단계는 선택 사항입니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center gap-3 bg-gray-100 dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-700 rounded-xl p-8 hover:border-[#ff3d7f] transition-colors group">
                <div className="w-16 h-16 rounded-full bg-[#ff3d7f]/10 flex items-center justify-center group-hover:bg-[#ff3d7f]/20 transition-colors">
                  <svg className="w-8 h-8 text-[#ff3d7f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-gray-900 dark:text-white font-semibold">버추얼 스튜디오</span>
                <span className="text-gray-500 text-sm">준비 중</span>
              </button>

              <button className="flex flex-col items-center justify-center gap-3 bg-gray-100 dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-700 rounded-xl p-8 hover:border-[#c084fc] transition-colors group">
                <div className="w-16 h-16 rounded-full bg-[#c084fc]/10 flex items-center justify-center group-hover:bg-[#c084fc]/20 transition-colors">
                  <svg className="w-8 h-8 text-[#c084fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-gray-900 dark:text-white font-semibold">컨셉 스튜디오</span>
                <span className="text-gray-500 text-sm">준비 중</span>
              </button>
            </div>

            <button
              onClick={() => {
                setVisualData({ skipped: true });
                setShowPreview(true);
              }}
              className="w-full py-3 rounded-xl font-medium text-gray-400 bg-[#1a1a2e] border border-gray-700 hover:border-gray-500 transition-colors"
            >
              건너뛰기
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // ── 제안서 미리보기 ─────────────────────────────────────
  const renderPreview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">제안서 미리보기</h2>

      {/* 세계관 */}
      <div className="bg-gray-100 dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-700 rounded-xl p-5">
        <h3 className="text-[#ff3d7f] font-semibold mb-2">세계관</h3>
        <p className="text-gray-400 text-sm">키워드: {worldbuilding.keywords || "-"}</p>
        <p className="text-gray-400 text-sm">
          분위기: {worldbuilding.mood === "bright" ? "밝은" : worldbuilding.mood === "dark" ? "어두운" : "중립"}
        </p>
        {worldbuildingResult && (
          <p className="text-gray-300 text-sm mt-2 whitespace-pre-line">{worldbuildingResult}</p>
        )}
      </div>

      {/* 그룹 컨셉 */}
      <div className="bg-gray-100 dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-700 rounded-xl p-5">
        <h3 className="text-[#ff3d7f] font-semibold mb-2">그룹 컨셉</h3>
        <p className="text-gray-400 text-sm">장르: {groupConcept.genres.join(", ") || "-"}</p>
        <p className="text-gray-400 text-sm">타겟 팬덤: {groupConcept.targetFandom || "-"}</p>
        <p className="text-gray-400 text-sm">
          활동 형태: {groupConcept.activityFormats.join(", ") || "-"}
        </p>
        <p className="text-gray-400 text-sm">차별화: {groupConcept.differentiation || "-"}</p>
      </div>

      {/* 그룹 이름 */}
      <div className="bg-gray-100 dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-700 rounded-xl p-5">
        <h3 className="text-[#ff3d7f] font-semibold mb-2">그룹 이름</h3>
        <p className="text-gray-900 dark:text-white text-xl font-bold">{finalGroupName || "-"}</p>
      </div>

      {/* 멤버 */}
      <div className="bg-gray-100 dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-700 rounded-xl p-5">
        <h3 className="text-[#ff3d7f] font-semibold mb-3">멤버 ({membersData.count}명)</h3>
        <div className="space-y-3">
          {membersData.members.map((m, i) => (
            <div key={i} className="border-b border-gray-700/50 pb-2 last:border-0 last:pb-0">
              <p className="text-gray-900 dark:text-white font-medium">
                {m.name || `멤버 ${i + 1}`}
                {m.nationality && (
                  <span className="text-gray-500 text-sm ml-2">({m.nationality})</span>
                )}
              </p>
              {m.positions.length > 0 && (
                <p className="text-[#c084fc] text-sm">{m.positions.join(", ")}</p>
              )}
              {m.character && <p className="text-gray-400 text-sm">{m.character}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={handleDownloadPDF}
          className="flex-1 py-3.5 rounded-xl font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1a1a2e] border border-gray-700 hover:border-gray-500 transition-colors"
        >
          PDF 다운로드
        </button>
        <button
          onClick={() => setShowPublishModal(true)}
          className="flex-1 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#ff3d7f] to-[#c084fc] hover:opacity-90 transition-opacity"
        >
          발행하기
        </button>
      </div>

      <button
        onClick={() => setShowPreview(false)}
        className="w-full py-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
      >
        수정하러 돌아가기
      </button>
    </div>
  );

  // ── 메인 레이아웃 ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI 아이돌 프로젝트
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">AI와 함께 나만의 아이돌 그룹을 기획하세요</p>
        </div>

        {/* 스텝 인디케이터 */}
        {!showPreview && (
          <div className="flex items-center justify-between mb-10">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(i)}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      i === currentStep
                        ? "bg-[#ff3d7f] text-white shadow-lg shadow-[#ff3d7f]/30"
                        : i < currentStep
                        ? "bg-[#c084fc] text-white"
                        : "bg-gray-100 dark:bg-[#1a1a2e] text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    {i < currentStep ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1.5 hidden sm:block ${
                      i === currentStep ? "text-[#ff3d7f] font-medium" : "text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                </button>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-1 ${
                      i < currentStep ? "bg-[#c084fc]" : "bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* 콘텐츠 */}
        {showPreview ? renderPreview() : renderStep()}

        {/* 이전 / 다음 버튼 */}
        {!showPreview && (
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              className="px-6 py-2.5 rounded-xl font-medium text-gray-400 bg-[#1a1a2e] border border-gray-700 hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              이전
            </button>
            {currentStep < STEP_LABELS.length - 1 ? (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="px-6 py-2.5 rounded-xl font-medium text-white bg-[#ff3d7f] hover:bg-[#ff3d7f]/90 transition-colors"
              >
                다음
              </button>
            ) : (
              <button
                onClick={() => setShowPreview(true)}
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#ff3d7f] to-[#c084fc] hover:opacity-90 transition-opacity"
              >
                제안서 미리보기
              </button>
            )}
          </div>
        )}
      </div>

      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        category="IDOL_PROJECT"
        contentData={{
          worldbuilding,
          worldbuildingResult,
          groupConcept,
          groupName: finalGroupName,
          members: membersData.members,
        }}
      />
    </div>
  );
}
