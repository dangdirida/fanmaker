'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Plus } from 'lucide-react';
import { loadGame } from '@/lib/idol-game/saveManager';

interface SaveInfo {
  groupName: string;
  stage: string;
  week: number;
  concept: string;
  groupType: string;
}

type PageState = 'loading' | 'choice';

export default function IdolGameEntryPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [saveInfo, setSaveInfo] = useState<SaveInfo | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const result = await loadGame();

      if (cancelled) return;

      if (!result || !result.hasSave) {
        router.push('/studio/idol-game/setup');
        return;
      }

      const save = result.save;
      setSaveInfo({
        groupName: save?.groupName ?? '',
        stage: save?.stage ?? '',
        week: save?.week ?? 1,
        concept: save?.concept ?? '',
        groupType: save?.groupType ?? '',
      });
      setPageState('choice');
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // -- 로딩 화면 --
  if (pageState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
          <p className="text-sm text-gray-400">
            게임 데이터를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  function groupTypeLabel(type: string): string {
    switch (type) {
      case 'girl': return '걸그룹';
      case 'boy': return '보이그룹';
      case 'mixed': return '혼성그룹';
      default: return type;
    }
  }

  // -- 이어하기 / 새 게임 선택 화면 --
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      {/* 확인 다이얼로그 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">
              새 게임 시작
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-300">
              기존 세이브가 삭제됩니다. 정말 새로 시작하시겠어요?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-white/10 bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
              >
                취소
              </button>
              <button
                onClick={() => router.push('/studio/idol-game/setup')}
                className="flex-1 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500"
              >
                새로 시작
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 선택 카드 */}
      <div className="w-full max-w-md">
        <h1
          className="mb-2 text-center text-2xl font-bold text-white"
          style={{ fontFamily: 'serif' }}
        >
          아이돌 키우기
        </h1>
        <p className="mb-8 text-center text-sm text-gray-400">
          프로듀서님, 다시 돌아오셨군요!
        </p>

        {/* 세이브 정보 카드 */}
        {saveInfo && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-gray-900/80 p-5 backdrop-blur-md">
            <div className="mb-3 flex items-center justify-between">
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: 'serif' }}
              >
                {saveInfo.groupName || '이름 없음'}
              </h2>
              <span className="rounded-full bg-purple-600/30 px-3 py-0.5 text-xs font-medium text-purple-300">
                {saveInfo.stage}
              </span>
            </div>
            <div className="flex gap-4 text-sm text-gray-400">
              <span>{groupTypeLabel(saveInfo.groupType)}</span>
              <span className="text-white/20">|</span>
              <span>{saveInfo.concept}</span>
              <span className="text-white/20">|</span>
              <span>Week {saveInfo.week}</span>
            </div>
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/studio/idol-game/play')}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-purple-600 px-6 py-4 text-base font-semibold text-white transition-all hover:bg-purple-500 hover:-translate-y-0.5"
          >
            <Play className="h-5 w-5 transition-transform group-hover:scale-110" />
            이어하기
          </button>

          <button
            onClick={() => setShowConfirm(true)}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-gray-800/60 px-6 py-4 text-base font-medium text-gray-300 transition-all hover:bg-gray-700/60 hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5 transition-transform group-hover:scale-110" />
            새 게임 시작
          </button>
        </div>
      </div>
    </div>
  );
}
