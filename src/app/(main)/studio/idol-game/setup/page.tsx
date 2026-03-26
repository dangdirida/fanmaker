"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check,
  User as UserIcon,
  UserRound,
} from "lucide-react";
import { useIdolGameStore } from "@/store/useIdolGameStore";
import VRMViewer from "@/components/idol-game/VRMViewer";
import { saveGame } from "@/lib/idol-game/saveManager";

// -- 상수 --

const CONCEPTS = [
  {
    id: "dark",
    label: "다크 & 카리스마",
    desc: "강렬한 퍼포먼스, 세계관 중심",
  },
  {
    id: "fresh",
    label: "청량 & 성장형",
    desc: "풋풋함, 팬과 함께 성장",
  },
  {
    id: "emotional",
    label: "감성 아티스트형",
    desc: "음악성, 깊은 팬층",
  },
  {
    id: "cute",
    label: "큐트 & 발랄",
    desc: "중독성, 대중 친화적",
  },
  {
    id: "experimental",
    label: "실험적 & 독창적",
    desc: "화제성, 고위험 고수익",
  },
] as const;

const GROUP_TYPES = [
  { id: "girl" as const, label: "걸그룹" },
  { id: "boy" as const, label: "보이그룹" },
  { id: "mixed" as const, label: "혼성 그룹" },
];

const STEP_LABELS = [
  "그룹 정보",
  "성별 배정",
  "이름 입력",
  "확인",
];

// -- 컴포넌트 --

function ProgressIndicator({
  step,
  totalSteps,
}: {
  step: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < step;
        const isCurrent = stepNum === step;
        return (
          <div key={stepNum} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  transition-colors duration-200
                  ${
                    isCurrent
                      ? "bg-purple-600 text-white"
                      : isCompleted
                        ? "bg-purple-600/30 text-purple-300"
                        : "bg-neutral-700 text-neutral-400"
                  }
                `}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span
                className={`text-[10px] ${
                  isCurrent
                    ? "text-purple-300 font-medium"
                    : "text-neutral-500"
                }`}
              >
                {STEP_LABELS[i]}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`w-8 h-px mb-4 ${
                  stepNum < step ? "bg-purple-600/50" : "bg-neutral-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function IdolGameSetupPage() {
  const router = useRouter();
  const store = useIdolGameStore();

  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState<"girl" | "boy" | "mixed" | null>(
    null
  );
  const [memberCount, setMemberCount] = useState(4);
  const [concept, setConcept] = useState<string | null>(null);
  const [memberGenders, setMemberGenders] = useState<("female" | "male")[]>(
    () => Array(4).fill("female")
  );
  const [memberNames, setMemberNames] = useState<string[]>(() =>
    Array(4).fill("")
  );
  const [isSaving, setIsSaving] = useState(false);

  // memberCount 변경 시 배열 크기 동기화
  useEffect(() => {
    setMemberGenders((prev) => {
      const defaultGender: "female" | "male" =
        groupType === "boy" ? "male" : "female";
      const next = Array.from(
        { length: memberCount },
        (_, i) => prev[i] ?? defaultGender
      );
      return next;
    });
    setMemberNames((prev) => {
      const next = Array.from(
        { length: memberCount },
        (_, i) => prev[i] ?? ""
      );
      return next;
    });
  }, [memberCount, groupType]);

  // groupType 변경 시 성별 자동 설정
  useEffect(() => {
    if (groupType === "girl") {
      setMemberGenders(Array(memberCount).fill("female"));
    } else if (groupType === "boy") {
      setMemberGenders(Array(memberCount).fill("male"));
    }
  }, [groupType, memberCount]);

  // -- Step 유효성 --

  const isStep1Valid =
    groupName.trim().length > 0 &&
    groupType !== null &&
    concept !== null;

  const isStep3Valid = true; // 빈 이름은 기본값으로 대체

  function canGoNext(): boolean {
    switch (step) {
      case 1:
        return isStep1Valid;
      case 2:
        return true;
      case 3:
        return isStep3Valid;
      default:
        return false;
    }
  }

  // -- 게임 시작 --

  async function handleStartGame() {
    if (isSaving) return;
    setIsSaving(true);

    try {
      // 빈 이름에 기본값 적용
      const finalNames = memberNames.map(
        (name, i) => name.trim() || `멤버${i + 1}`
      );

      const members = finalNames.map((name, i) => ({
        id: `member-${i + 1}`,
        name,
        gender: memberGenders[i],
      }));

      store.setGroupInfo({
        groupName: groupName.trim(),
        groupType: groupType!,
        concept: concept!,
        memberCount,
      });
      store.setMembers(members);

      const payload = {
        groupName: groupName.trim(),
        groupType: groupType!,
        concept: concept!,
        membersJson: JSON.stringify(members),
        statsJson: JSON.stringify({
          vocal: 60,
          dance: 60,
          charm: 60,
          mental: 60,
        }),
        stage: "연습생",
        week: 1,
        energy: 5,
        currentSceneId: "ch1_intro",
        flagsJson: JSON.stringify({}),
        choiceHistoryJson: JSON.stringify([]),
        conceptBoardJson: JSON.stringify({}),
        playtimeMinutes: 0,
      };

      await saveGame(payload);
      router.push("/studio/idol-game/play");
    } catch (err) {
      console.error("게임 시작 실패:", err);
      setIsSaving(false);
    }
  }

  // -- 성별 토글 --

  // -- 컨셉 라벨 매핑 --

  function getConceptLabel(id: string): string {
    return CONCEPTS.find((c) => c.id === id)?.label ?? id;
  }

  function getGroupTypeLabel(type: string): string {
    return GROUP_TYPES.find((g) => g.id === type)?.label ?? type;
  }

  // -- 렌더링 --

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-lg px-4 pb-32">
        <ProgressIndicator step={step} totalSteps={4} />

        {/* Step 1: 그룹 기본 정보 */}
        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-center text-xl font-serif font-semibold text-neutral-100">
              당신의 아이돌 그룹을 만들어보세요
            </h1>

            {/* 그룹명 */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                그룹명
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) =>
                  setGroupName(e.target.value.slice(0, 20))
                }
                maxLength={20}
                placeholder="그룹명을 입력하세요"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-100
                  placeholder:text-neutral-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500
                  transition-colors"
              />
              <p className="mt-1 text-right text-xs text-neutral-500">
                {groupName.length}/20
              </p>
            </div>

            {/* 그룹 유형 */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                그룹 유형
              </label>
              <div className="grid grid-cols-3 gap-3">
                {GROUP_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setGroupType(type.id)}
                    className={`
                      rounded-lg border-2 px-3 py-3 text-sm font-medium transition-all
                      ${
                        groupType === type.id
                          ? "border-purple-500 bg-purple-500/10 text-purple-300"
                          : "border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-600"
                      }
                    `}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 멤버 수 */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                멤버 수
              </label>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() =>
                    setMemberCount((c) => Math.max(2, c - 1))
                  }
                  disabled={memberCount <= 2}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-600
                    bg-neutral-800 text-neutral-300 transition-colors
                    hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-4xl font-bold text-neutral-100 tabular-nums w-12 text-center">
                  {memberCount}
                </span>
                <button
                  onClick={() =>
                    setMemberCount((c) => Math.min(9, c + 1))
                  }
                  disabled={memberCount >= 9}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-600
                    bg-neutral-800 text-neutral-300 transition-colors
                    hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 컨셉 */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                데뷔 목표 컨셉
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CONCEPTS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setConcept(c.id)}
                    className={`
                      rounded-lg border-2 p-3 text-left transition-all
                      ${
                        concept === c.id
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-neutral-700 bg-neutral-900 hover:border-neutral-600"
                      }
                    `}
                  >
                    <span
                      className={`block text-sm font-medium ${
                        concept === c.id
                          ? "text-purple-300"
                          : "text-neutral-200"
                      }`}
                    >
                      {c.label}
                    </span>
                    <span className="block mt-1 text-xs text-neutral-500">
                      {c.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 멤버 성별 배정 */}
        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-center text-xl font-serif font-semibold text-neutral-100">
              멤버들의 성별을 배정해주세요
            </h1>

            {groupType !== "mixed" && (
              <p className="text-center text-sm text-neutral-500">
                그룹 유형에 따라 자동 설정됨
              </p>
            )}

            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: memberCount }, (_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center rounded-lg border border-neutral-700 bg-neutral-900 p-3"
                >
                  <span className="text-xs text-neutral-400 mb-2">
                    멤버 {i + 1}
                  </span>
                  <VRMViewer
                    gender={memberGenders[i]}
                    width={70}
                    height={120}
                  />
                  <div className="mt-2 flex rounded-md overflow-hidden border border-neutral-600">
                    <button
                      onClick={() => {
                        if (groupType === "mixed") {
                          const next = [...memberGenders];
                          next[i] = "female";
                          setMemberGenders(next);
                        }
                      }}
                      disabled={groupType !== "mixed"}
                      className={`
                        px-3 py-1 text-xs transition-colors
                        ${
                          memberGenders[i] === "female"
                            ? "bg-purple-600 text-white"
                            : "bg-neutral-800 text-neutral-400"
                        }
                        ${groupType !== "mixed" ? "cursor-not-allowed" : "hover:bg-purple-500"}
                      `}
                    >
                      여성
                    </button>
                    <button
                      onClick={() => {
                        if (groupType === "mixed") {
                          const next = [...memberGenders];
                          next[i] = "male";
                          setMemberGenders(next);
                        }
                      }}
                      disabled={groupType !== "mixed"}
                      className={`
                        px-3 py-1 text-xs transition-colors
                        ${
                          memberGenders[i] === "male"
                            ? "bg-purple-600 text-white"
                            : "bg-neutral-800 text-neutral-400"
                        }
                        ${groupType !== "mixed" ? "cursor-not-allowed" : "hover:bg-purple-500"}
                      `}
                    >
                      남성
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: 멤버 이름 입력 */}
        {step === 3 && (
          <div className="space-y-6">
            <h1 className="text-center text-xl font-serif font-semibold text-neutral-100">
              멤버들의 이름(예명)을 입력해주세요
            </h1>

            <div className="space-y-3">
              {Array.from({ length: memberCount }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3"
                >
                  <span className="text-sm font-medium text-neutral-500 w-6 text-center">
                    {i + 1}
                  </span>
                  {memberGenders[i] === "male" ? (
                    <UserIcon className="w-4 h-4 text-blue-400 shrink-0" />
                  ) : (
                    <UserRound className="w-4 h-4 text-pink-400 shrink-0" />
                  )}
                  <input
                    type="text"
                    value={memberNames[i]}
                    onChange={(e) => {
                      const next = [...memberNames];
                      next[i] = e.target.value.slice(0, 10);
                      setMemberNames(next);
                    }}
                    maxLength={10}
                    placeholder={`멤버 ${i + 1}`}
                    className="flex-1 bg-transparent text-neutral-100 placeholder:text-neutral-600 focus:outline-none text-sm"
                  />
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-neutral-500">
              빈칸은 기본 이름으로 자동 설정됩니다
            </p>
          </div>
        )}

        {/* Step 4: 확인 & 시작 */}
        {step === 4 && (
          <div className="space-y-6">
            <h1 className="text-center text-xl font-serif font-semibold text-neutral-100">
              이제 시작할 준비가 됐어요
            </h1>

            <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-6 space-y-4">
              {/* 그룹명 */}
              <h2 className="text-2xl font-serif font-bold text-center text-neutral-100">
                {groupName.trim()}
              </h2>

              {/* 유형 + 컨셉 배지 */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="inline-block rounded-full bg-purple-600/20 px-3 py-1 text-xs font-medium text-purple-300">
                  {getGroupTypeLabel(groupType!)}
                </span>
                <span className="inline-block rounded-full bg-neutral-700 px-3 py-1 text-xs font-medium text-neutral-300">
                  {getConceptLabel(concept!)}
                </span>
              </div>

              {/* 멤버 목록 */}
              <div className="border-t border-neutral-700 pt-4">
                <p className="text-xs text-neutral-500 mb-3">
                  멤버 ({memberCount}명)
                </p>
                <div className="space-y-2">
                  {Array.from({ length: memberCount }, (_, i) => {
                    const displayName =
                      memberNames[i]?.trim() || `멤버${i + 1}`;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-md bg-neutral-800 px-3 py-2"
                      >
                        {memberGenders[i] === "male" ? (
                          <UserIcon className="w-4 h-4 text-blue-400 shrink-0" />
                        ) : (
                          <UserRound className="w-4 h-4 text-pink-400 shrink-0" />
                        )}
                        <span className="text-sm text-neutral-200">
                          {displayName}
                        </span>
                        <span className="ml-auto text-xs text-neutral-500">
                          {memberGenders[i] === "female"
                            ? "여성"
                            : "남성"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border border-neutral-600 bg-neutral-800 py-3 text-sm font-medium
                  text-neutral-300 transition-colors hover:bg-neutral-700"
              >
                수정하기
              </button>
              <button
                onClick={handleStartGame}
                disabled={isSaving}
                className="flex-1 rounded-lg bg-purple-600 py-3 text-sm font-medium text-white
                  transition-colors hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "저장 중..." : "게임 시작"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 (step 4 제외) */}
      {step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-sm">
          <div className="mx-auto max-w-lg flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step <= 1}
              className="flex items-center gap-1 text-sm text-neutral-400 transition-colors
                hover:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </button>

            <button
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              disabled={!canGoNext()}
              className={`
                flex items-center gap-1 rounded-lg px-6 py-2.5 text-sm font-medium transition-all
                ${
                  canGoNext()
                    ? "bg-purple-600 text-white hover:bg-purple-500"
                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                }
              `}
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
