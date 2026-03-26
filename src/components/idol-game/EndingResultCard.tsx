"use client";

import { Trophy, Star, Share2, RotateCcw } from "lucide-react";

interface EndingData {
  type: "legend" | "award" | "global" | "crisis";
  title: string;
  description: string;
  finalStats: boolean;
  unlockedRoutes?: string[];
  shareCardText: string;
}

interface EndingResultCardProps {
  endingData: EndingData;
  stats: { vocal: number; dance: number; charm: number; mental: number };
  groupName: string;
  members: Array<{ name: string; gender: string }>;
  conceptBoardAssets: { logoUrl?: string; coverUrl?: string };
  onShare: () => void;
  onRestart: () => void;
}

// 루트 ID -> 한국어 매핑
const routeNameMap: Record<string, string> = {
  award_route_2nd: "대상 루트",
  global_route_2nd: "글로벌 루트",
  solo_route_2nd: "솔로 루트",
  crisis_route_2nd: "위기 루트",
  crisis_hidden: "히든 루트",
};

// 엔딩 타입별 그라데이션
const endingGradients: Record<string, string> = {
  legend: "from-yellow-900/80 via-amber-950/60 to-black",
  award: "from-purple-900/80 via-violet-950/60 to-black",
  global: "from-blue-900/80 via-sky-950/60 to-black",
  crisis: "from-red-900/80 via-rose-950/60 to-black",
};

export default function EndingResultCard({
  endingData,
  stats,
  groupName,
  members,
  conceptBoardAssets,
  onShare,
  onRestart,
}: EndingResultCardProps) {
  const gradient = endingGradients[endingData.type] || endingGradients.legend;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gradient-to-b ${gradient}`}
    >
      <div className="flex w-full max-w-lg flex-col items-center px-6 py-12">
        {/* 장식 아이콘 */}
        <div className="mb-4 flex items-center gap-2 text-yellow-400/60">
          <Star size={20} className="animate-pulse" />
          <Trophy size={32} />
          <Star size={20} className="animate-pulse" />
        </div>

        {/* 그룹명 */}
        <p className="mb-2 text-sm font-medium tracking-widest text-white/40 uppercase">
          {groupName}
        </p>

        {/* 엔딩 타이틀 */}
        <h1 className="mb-4 text-center font-serif text-3xl font-bold leading-tight text-white md:text-4xl">
          {endingData.title}
        </h1>

        {/* 엔딩 설명 */}
        <p className="mb-8 max-w-md text-center text-sm leading-relaxed text-white/60">
          {endingData.description}
        </p>

        {/* 컨셉 보드 에셋 */}
        {(conceptBoardAssets.logoUrl || conceptBoardAssets.coverUrl) && (
          <div className="mb-8 flex items-center gap-4">
            {conceptBoardAssets.logoUrl && (
              <img
                src={conceptBoardAssets.logoUrl}
                alt="Group Logo"
                className="h-16 w-16 rounded-xl border border-white/10 object-cover shadow-lg"
              />
            )}
            {conceptBoardAssets.coverUrl && (
              <img
                src={conceptBoardAssets.coverUrl}
                alt="Album Cover"
                className="h-16 w-16 rounded-xl border border-white/10 object-cover shadow-lg"
              />
            )}
          </div>
        )}

        {/* 멤버 목록 */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {members.map((member, i) => (
            <span
              key={i}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
            >
              {member.name}
            </span>
          ))}
        </div>

        {/* 최종 스탯 카드 */}
        {endingData.finalStats && (
          <div className="mb-8 grid w-full max-w-sm grid-cols-2 gap-3">
            <StatCard label="Vocal" value={stats.vocal} color="text-blue-400" bgColor="bg-blue-500/10" borderColor="border-blue-500/20" />
            <StatCard label="Dance" value={stats.dance} color="text-pink-400" bgColor="bg-pink-500/10" borderColor="border-pink-500/20" />
            <StatCard label="Charm" value={stats.charm} color="text-orange-400" bgColor="bg-orange-500/10" borderColor="border-orange-500/20" />
            <StatCard label="Mental" value={stats.mental} color="text-green-400" bgColor="bg-green-500/10" borderColor="border-green-500/20" />
          </div>
        )}

        {/* 해금 루트 */}
        {endingData.unlockedRoutes && endingData.unlockedRoutes.length > 0 && (
          <div className="mb-8 w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="mb-3 text-center text-sm font-semibold text-white/80">
              2회차 해금 루트:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {endingData.unlockedRoutes.map((routeId) => (
                <span
                  key={routeId}
                  className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-300"
                >
                  {routeNameMap[routeId] || routeId}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="flex w-full max-w-sm flex-col gap-3">
          <button
            onClick={onShare}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-base font-bold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-500"
          >
            <Share2 size={18} />
            팬 유니버스에 공유하기
          </button>
          <button
            onClick={onRestart}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-base font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <RotateCcw size={18} />
            다시 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}

// 스탯 카드 서브 컴포넌트
function StatCard({
  label,
  value,
  color,
  bgColor,
  borderColor,
}: {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl border ${borderColor} ${bgColor} px-4 py-3`}
    >
      <span className="mb-1 text-xs font-medium text-white/50">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
