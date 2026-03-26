"use client";

import { Palette } from "lucide-react";

interface ConceptBoardPanelProps {
  logoUrl?: string;
  coverUrl?: string;
  showConceptStudioBtn?: boolean;
  onOpenConceptStudio?: () => void;
}

export default function ConceptBoardPanel({
  logoUrl,
  coverUrl,
  showConceptStudioBtn,
  onOpenConceptStudio,
}: ConceptBoardPanelProps) {
  // 표시할 내용이 없으면 렌더링하지 않음
  const hasAssets = Boolean(logoUrl || coverUrl);
  const hasButton = Boolean(showConceptStudioBtn);

  if (!hasAssets && !hasButton) return null;

  return (
    <div className="absolute bottom-28 right-4 z-30 flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-md">
      {/* 로고 썸네일 */}
      {logoUrl && (
        <div className="group relative">
          <img
            src={logoUrl}
            alt="Logo"
            className="h-12 w-12 rounded-lg border border-white/10 object-cover shadow-sm transition group-hover:border-white/30"
          />
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-[10px] text-white/60 opacity-0 transition group-hover:opacity-100">
            로고
          </span>
        </div>
      )}

      {/* 커버 썸네일 */}
      {coverUrl && (
        <div className="group relative">
          <img
            src={coverUrl}
            alt="Cover"
            className="h-12 w-12 rounded-lg border border-white/10 object-cover shadow-sm transition group-hover:border-white/30"
          />
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-[10px] text-white/60 opacity-0 transition group-hover:opacity-100">
            커버
          </span>
        </div>
      )}

      {/* 컨셉 스튜디오 버튼 */}
      {showConceptStudioBtn && (
        <>
          {hasAssets && (
            <div className="mx-1 h-8 w-px bg-white/10" />
          )}
          <button
            onClick={onOpenConceptStudio}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <Palette size={14} />
            컨셉 스튜디오
          </button>
        </>
      )}
    </div>
  );
}
