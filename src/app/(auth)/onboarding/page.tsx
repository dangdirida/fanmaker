"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type Artist = {
  id: string;
  name: string;
  nameEn: string | null;
  groupImageUrl: string | null;
};

const ACTIVITY_TYPES = [
  {
    value: "LIGHT",
    label: "라이트팬",
    description: "좋아하는 아티스트 콘텐츠를 감상해요",
    emoji: "💖",
  },
  {
    value: "CREATIVE",
    label: "창작팬",
    description: "팬아트, 리믹스 등 직접 만들어요",
    emoji: "🎨",
  },
  {
    value: "GLOBAL",
    label: "글로벌팬",
    description: "해외 팬들과 소통하고 번역해요",
    emoji: "🌍",
  },
  {
    value: "CREATOR",
    label: "예비 크리에이터",
    description: "프로 크리에이터를 꿈꿔요",
    emoji: "⭐",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [activityType, setActivityType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 아티스트 목록 로드
  useEffect(() => {
    fetch("/api/artists")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setArtists(data.data);
      })
      .catch(() => {});
  }, []);

  // 닉네임 중복 검사
  const checkNickname = async () => {
    if (!nickname.trim() || nickname.length < 2) {
      setNicknameError("닉네임은 2자 이상이어야 해요");
      return;
    }
    if (nickname.length > 20) {
      setNicknameError("닉네임은 20자 이하여야 해요");
      return;
    }

    setCheckingNickname(true);
    try {
      const res = await fetch(
        `/api/users/check-nickname?nickname=${encodeURIComponent(nickname)}`
      );
      const data = await res.json();
      if (data.available) {
        setNicknameChecked(true);
        setNicknameError("");
      } else {
        setNicknameError("이미 사용 중인 닉네임이에요");
        setNicknameChecked(false);
      }
    } catch {
      setNicknameError("확인에 실패했어요. 다시 시도해주세요");
    } finally {
      setCheckingNickname(false);
    }
  };

  // 아티스트 선택 토글
  const toggleArtist = (artistId: string) => {
    setSelectedArtists((prev) => {
      if (prev.includes(artistId)) {
        return prev.filter((id) => id !== artistId);
      }
      if (prev.length >= 5) return prev;
      return [...prev, artistId];
    });
  };

  // 온보딩 완료
  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/users/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          artistIds: selectedArtists,
          activityType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await update(); // 세션 갱신
        router.push("/feed");
      }
    } catch {
      alert("오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = () => {
    if (step === 1) return nicknameChecked;
    if (step === 2) return true; // 아티스트 선택은 선택사항
    if (step === 3) return activityType !== "";
    return false;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center px-4 py-8">
      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-2 mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s <= step
                  ? "bg-black text-white"
                  : "bg-gray-800 text-gray-500"
              }`}
            >
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-0.5 ${
                  s < step ? "bg-black" : "bg-gray-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg">
        {/* Step 1: 닉네임 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                닉네임을 정해주세요
              </h2>
              <p className="text-gray-400">
                팬메이커에서 사용할 이름이에요
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setNicknameChecked(false);
                    setNicknameError("");
                  }}
                  placeholder="닉네임 입력 (2~20자)"
                  maxLength={20}
                  className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors"
                />
                <button
                  onClick={checkNickname}
                  disabled={checkingNickname || !nickname.trim()}
                  className="px-4 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {checkingNickname ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "중복확인"
                  )}
                </button>
              </div>
              {nicknameError && (
                <p className="text-red-400 text-sm">{nicknameError}</p>
              )}
              {nicknameChecked && (
                <p className="text-green-400 text-sm">
                  사용 가능한 닉네임이에요!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: 관심 아티스트 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                관심 아티스트를 선택해주세요
              </h2>
              <p className="text-gray-400">
                최대 5개까지 선택할 수 있어요 (선택사항)
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {artists.map((artist) => (
                <button
                  key={artist.id}
                  onClick={() => toggleArtist(artist.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedArtists.includes(artist.id)
                      ? "border-black bg-black/10 text-white"
                      : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-800 flex items-center justify-center text-lg">
                    {artist.name.charAt(0)}
                  </div>
                  <p className="text-xs truncate">{artist.name}</p>
                </button>
              ))}
            </div>
            <p className="text-center text-gray-500 text-sm">
              {selectedArtists.length}/5 선택됨
            </p>
          </div>
        )}

        {/* Step 3: 활동 유형 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                어떤 활동을 하고 싶으세요?
              </h2>
              <p className="text-gray-400">
                맞춤 콘텐츠를 추천해드릴게요
              </p>
            </div>
            <div className="space-y-3">
              {ACTIVITY_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setActivityType(type.value)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${
                    activityType === type.value
                      ? "border-black bg-black/10"
                      : "border-gray-700 bg-gray-900 hover:border-gray-600"
                  }`}
                >
                  <span className="text-2xl">{type.emoji}</span>
                  <div>
                    <p className="text-white font-medium">{type.label}</p>
                    <p className="text-gray-400 text-sm">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-1 text-gray-400 hover:text-white disabled:opacity-0 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1 bg-black text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canNext() || submitting}
              className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
