'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, X } from 'lucide-react';

import { useIdolGameStore } from '@/store/useIdolGameStore';
import {
  saveGame,
  loadGame,
  checkEnergy,
  consumeEnergy,
} from '@/lib/idol-game/saveManager';
import {
  loadScene,
  type SceneData,
  type ChoiceData,
} from '@/lib/idol-game/sceneEngine';

import StatBar from '@/components/idol-game/StatBar';
import SceneRenderer from '@/components/idol-game/SceneRenderer';
import SceneTitleFlash from '@/components/idol-game/SceneTitleFlash';
import StatChangePopup from '@/components/idol-game/StatChangePopup';
import ConceptBoardPanel from '@/components/idol-game/ConceptBoardPanel';
import SaveToast from '@/components/idol-game/SaveToast';
import EnergyBar from '@/components/idol-game/EnergyBar';
import DialogBox from '@/components/idol-game/DialogBox';
import VRMViewer from '@/components/idol-game/VRMViewer';
import CameraDanceModal from '@/components/idol-game/CameraDanceModal';
import VirtualStudioPopup from '@/components/idol-game/VirtualStudioPopup';
import EndingResultCard from '@/components/idol-game/EndingResultCard';

// -- 유틸 --

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// -- 페이지 --

export default function IdolGamePlayPage() {
  const router = useRouter();
  const store = useIdolGameStore();

  // 로컬 UI 상태
  const [isLoading, setIsLoading] = useState(true);
  const [scene, setScene] = useState<SceneData | null>(null);
  const [bgKey, setBgKey] = useState('practice_room');
  const [titleFlash, setTitleFlash] = useState<string | null>(null);
  const [spotlight, setSpotlight] = useState(false);
  const [choiceDisabled, setChoiceDisabled] = useState(false);
  const [energyMax, setEnergyMax] = useState(5);

  // 카메라 댄스 모달
  const [cameraDanceOpen, setCameraDanceOpen] = useState(false);
  const [pendingCameraChoice, setPendingCameraChoice] = useState<{
    choice: ChoiceData;
    index: number;
  } | null>(null);

  // 버추얼 스튜디오 팝업
  const [virtualStudioOpen, setVirtualStudioOpen] = useState(false);

  // 에너지 모달
  const [showEnergyModal, setShowEnergyModal] = useState(false);

  // 대화 박스 높이 참조
  const dialogRef = useRef<HTMLDivElement>(null);
  const [dialogHeight, setDialogHeight] = useState(180);

  // 오토세이브 인터벌 참조
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTransitioningRef = useRef(false);

  // ------------------------------------------------------------------
  // goToScene: 씬 전환 핵심 함수
  // ------------------------------------------------------------------
  const goToScene = useCallback(
    async (sceneId: string) => {
      if (!sceneId) return;

      // 1. 전환 시작 (fade to black)
      isTransitioningRef.current = true;
      store.setIsTransitioning(true);
      await wait(350);

      // 2. 씬 데이터 로드
      const nextScene = loadScene(sceneId);
      if (!nextScene) {
        console.error('[goToScene] 씬을 찾을 수 없음:', sceneId);
        store.setIsTransitioning(false);
        isTransitioningRef.current = false;
        return;
      }

      // 3. 배경, 캐릭터, 타이틀 플래시, 스포트라이트 업데이트
      setScene(nextScene);
      setBgKey(nextScene.bg);
      setSpotlight(!!nextScene.spotlight);
      store.setCurrentScene(sceneId);

      // 타이틀 플래시
      if (nextScene.titleFlash) {
        setTitleFlash(nextScene.titleFlash);
      } else {
        setTitleFlash(null);
      }

      // 4. 전환 끝 (fade from black)
      store.setIsTransitioning(false);
      isTransitioningRef.current = false;
      await wait(350);

      // 선택지 활성화
      setChoiceDisabled(false);
    },
    [store],
  );

  // ------------------------------------------------------------------
  // 초기 로드
  // ------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1. 세이브 로드
      const result = await loadGame();
      if (cancelled) return;

      if (result?.hasSave && result.save) {
        store.loadFromSave(result.save);
      }

      // 2. 에너지 로드
      const energyResult = await checkEnergy();
      if (cancelled) return;

      if (energyResult) {
        store.setEnergy(energyResult.current);
        setEnergyMax(energyResult.max);
      }

      // 3. 현재 씬으로 이동
      const currentId =
        useIdolGameStore.getState().currentSceneId || 'ch1_intro';

      setIsLoading(false);

      await goToScene(currentId);
    }

    init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------------------
  // 30초 인터벌 백업 세이브
  // ------------------------------------------------------------------
  useEffect(() => {
    saveIntervalRef.current = setInterval(() => {
      const payload = useIdolGameStore.getState().getSavePayload();
      saveGame(payload).catch(() => {});
    }, 30_000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, []);

  // ------------------------------------------------------------------
  // beforeunload 세이브
  // ------------------------------------------------------------------
  useEffect(() => {
    function handleBeforeUnload() {
      const payload = useIdolGameStore.getState().getSavePayload();
      const blob = new Blob([JSON.stringify(payload)], {
        type: 'application/json',
      });
      navigator.sendBeacon('/api/idol-game/save', blob);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ------------------------------------------------------------------
  // DialogBox 높이 추적
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!dialogRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDialogHeight(entry.contentRect.height);
      }
    });
    observer.observe(dialogRef.current);
    return () => observer.disconnect();
  }, []);

  // ------------------------------------------------------------------
  // 비동기 세이브 + 토스트
  // ------------------------------------------------------------------
  const triggerSave = useCallback(async () => {
    const payload = useIdolGameStore.getState().getSavePayload();
    saveGame(payload).catch(() => {});
    store.setShowSaveToast(true);
    setTimeout(() => {
      store.setShowSaveToast(false);
    }, 1500);
  }, [store]);

  // ------------------------------------------------------------------
  // 선택지 클릭 핸들러
  // ------------------------------------------------------------------
  const handleChoice = useCallback(
    async (index: number) => {
      if (!scene || !scene.choices || choiceDisabled) return;
      const choice = scene.choices[index];
      if (!choice) return;

      // 1. 선택지 숨김
      setChoiceDisabled(true);

      // 2. 카메라 댄스 선택지인 경우
      if (choice.isCamera) {
        setPendingCameraChoice({ choice, index });
        setCameraDanceOpen(true);
        return;
      }

      // 3. 효과 적용 (100%)
      await applyChoiceEffect(choice, 1.0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scene, choiceDisabled],
  );

  // ------------------------------------------------------------------
  // 선택지 효과 적용 (카메라 결과 포함)
  // ------------------------------------------------------------------
  const applyChoiceEffect = useCallback(
    async (choice: ChoiceData, multiplier: number) => {
      // 스탯 효과 적용
      if (choice.effect) {
        const scaled = {
          vocal: choice.effect.vocal
            ? Math.round(choice.effect.vocal * multiplier)
            : undefined,
          dance: choice.effect.dance
            ? Math.round(choice.effect.dance * multiplier)
            : undefined,
          charm: choice.effect.charm
            ? Math.round(choice.effect.charm * multiplier)
            : undefined,
          mental: choice.effect.mental
            ? Math.round(choice.effect.mental * multiplier)
            : undefined,
        };
        store.applyEffect(scaled);

        // StatChangePopup 표시
        store.setStatChanges(scaled);
        setTimeout(() => store.setStatChanges(null), 1800);
      }

      // 플래그 설정
      if (choice.setFlags) {
        store.setFlags(choice.setFlags);
      }

      // 선택 기록
      store.addChoiceHistory(choice.text);

      // 에너지 소비
      if (scene?.energyCost) {
        const energyResult = await consumeEnergy(scene.energyCost);
        if (energyResult && 'code' in energyResult) {
          // ENERGY_EMPTY
          setShowEnergyModal(true);
          setChoiceDisabled(false);
          return;
        }
        if (energyResult && 'remaining' in energyResult) {
          store.setEnergy(energyResult.remaining);
        }
      }

      // 세이브 (비동기, 논블로킹)
      await triggerSave();

      // 결과 씬 처리: stageUp, weekAdvance, unlockFlag
      if (scene?.isResult && scene.resultData) {
        if (scene.resultData.stageUp) {
          store.setStage(scene.resultData.stageUp);
        }
        if (scene.resultData.weekAdvance) {
          store.advanceWeek(scene.resultData.weekAdvance);
        }
        if (scene.resultData.unlockFlag) {
          store.setFlags({ [scene.resultData.unlockFlag]: true });
        }
      }

      // 다음 씬으로 이동
      if (choice.nextSceneId) {
        await goToScene(choice.nextSceneId);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scene, store, goToScene, triggerSave],
  );

  // ------------------------------------------------------------------
  // 카메라 댄스 완료 핸들러
  // ------------------------------------------------------------------
  const handleCameraDanceComplete = useCallback(
    async (fullBonus: boolean) => {
      setCameraDanceOpen(false);
      if (!pendingCameraChoice) return;

      const multiplier = fullBonus ? 1.0 : 0.5;
      await applyChoiceEffect(pendingCameraChoice.choice, multiplier);
      setPendingCameraChoice(null);
    },
    [pendingCameraChoice, applyChoiceEffect],
  );

  // ------------------------------------------------------------------
  // "다음" 클릭 (선택지 없을 때)
  // ------------------------------------------------------------------
  const handleNext = useCallback(async () => {
    if (!scene?.nextSceneId) return;

    // 결과 씬 처리
    if (scene.isResult && scene.resultData) {
      if (scene.resultData.stageUp) {
        store.setStage(scene.resultData.stageUp);
      }
      if (scene.resultData.weekAdvance) {
        store.advanceWeek(scene.resultData.weekAdvance);
      }
      if (scene.resultData.unlockFlag) {
        store.setFlags({ [scene.resultData.unlockFlag]: true });
      }
    }

    await goToScene(scene.nextSceneId);
  }, [scene, store, goToScene]);

  // ------------------------------------------------------------------
  // 버추얼 스튜디오 완료 핸들러
  // ------------------------------------------------------------------
  const handleVirtualStudioComplete = useCallback(
    (imageUrl: string) => {
      store.updateMemberImage(0, imageUrl);
      setVirtualStudioOpen(false);
      triggerSave();
    },
    [store, triggerSave],
  );

  // ------------------------------------------------------------------
  // 엔딩 공유 핸들러
  // ------------------------------------------------------------------
  const handleEndingShare = useCallback(async () => {
    const state = useIdolGameStore.getState();
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'IDOL_PROJECT',
          content: scene?.endingData?.shareCardText ?? '',
          metadata: {
            groupName: state.groupName,
            stats: state.stats,
            stage: state.stage,
            endingType: scene?.endingData?.type,
          },
        }),
      });
    } catch {
      // 공유 실패 시 조용히 처리
    }
  }, [scene]);

  // ------------------------------------------------------------------
  // 엔딩 재시작 핸들러
  // ------------------------------------------------------------------
  const handleEndingRestart = useCallback(() => {
    store.resetGame();
    router.push('/studio/idol-game/setup');
  }, [store, router]);

  // ------------------------------------------------------------------
  // 렌더링
  // ------------------------------------------------------------------

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
          <p className="text-sm text-gray-400">게임을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 멤버 데이터
  const members = store.members;
  const activeMemberIndex = scene?.activeMemberIndex ?? -1;
  const isDancing = !!scene?.isDancing;
  const visibleMembers = scene?.visibleMembers ?? members.map((_, i) => i);
  const showVirtualStudioBtn = !!scene?.showVirtualStudioBtn;
  const showConceptBoard =
    !!(store.conceptBoardAssets.logoUrl || store.conceptBoardAssets.coverUrl) ||
    !!scene?.showConceptStudioBtn;

  // 엔딩 체크
  const isEnding = !!scene?.isEnding && !!scene?.endingData;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-black">
      {/* ======== StatBar ======== */}
      <div className="relative z-10" style={{ height: 52 }}>
        <StatBar
          stats={store.stats}
          groupName={store.groupName}
          stage={store.stage}
          week={store.week}
        />
      </div>

      {/* ======== GameArea ======== */}
      <div className="relative flex-1 overflow-hidden">
        {/* SceneRenderer - 배경 */}
        <div className="absolute inset-0">
          <SceneRenderer
            bgKey={bgKey}
            spotlight={spotlight}
            isTransitioning={store.isTransitioning}
          />
        </div>

        {/* Characters */}
        <div
          className="absolute left-0 right-0 flex items-end justify-center"
          style={{ bottom: dialogHeight + 20 }}
        >
          <div
            className="flex items-end justify-center gap-2"
            style={{ width: '100%', maxWidth: 600 }}
          >
            {visibleMembers.map((memberIdx) => {
              const member = members[memberIdx];
              if (!member) return null;

              const isActive =
                activeMemberIndex === -1 || activeMemberIndex === memberIdx;
              const memberWidth =
                members.length <= 4
                  ? 80
                  : members.length <= 6
                    ? 64
                    : 52;
              const memberHeight =
                members.length <= 4
                  ? 140
                  : members.length <= 6
                    ? 110
                    : 90;

              return (
                <div
                  key={member.id}
                  className="transition-all duration-300"
                  style={{
                    transform: isActive
                      ? 'scale(1.05) translateY(-6px)'
                      : 'scale(0.96)',
                    filter: isActive ? 'brightness(1)' : 'brightness(0.6)',
                  }}
                >
                  <VRMViewer
                    gender={member.gender}
                    customImageUrl={member.customImageUrl}
                    isActive={isActive}
                    isDancing={isDancing}
                    width={memberWidth}
                    height={memberHeight}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* SceneTitleFlash */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <SceneTitleFlash title={titleFlash} />
        </div>

        {/* StatChangePopup */}
        <div className="absolute right-4 top-[60px]">
          <StatChangePopup changes={store.statChanges} />
        </div>

        {/* EnergyBar (StatChangePopup이 없을 때) */}
        {!store.statChanges && (
          <div className="absolute right-4 top-[60px]">
            <EnergyBar current={store.energy} max={energyMax} />
          </div>
        )}

        {/* ConceptBoardPanel */}
        {showConceptBoard && (
          <div
            className="absolute right-4"
            style={{ bottom: dialogHeight + 20 }}
          >
            <ConceptBoardPanel
              logoUrl={store.conceptBoardAssets.logoUrl}
              coverUrl={store.conceptBoardAssets.coverUrl}
              showConceptStudioBtn={scene?.showConceptStudioBtn}
            />
          </div>
        )}

        {/* VirtualStudioBtn */}
        {showVirtualStudioBtn && (
          <div className="absolute left-4 top-[60px]">
            <button
              onClick={() => setVirtualStudioOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-black/60 px-3 py-2 text-xs font-medium text-purple-300 backdrop-blur-md transition-colors hover:bg-purple-900/40"
            >
              <Sparkles className="h-4 w-4" />
              버추얼 스튜디오
            </button>
          </div>
        )}

        {/* SaveToast */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: dialogHeight + 10 }}
        >
          <SaveToast show={store.showSaveToast} />
        </div>

        {/* TransitionOverlay */}
        <div
          className="pointer-events-none absolute inset-0 z-20 bg-black transition-opacity duration-[350ms]"
          style={{ opacity: store.isTransitioning ? 1 : 0 }}
        />
      </div>

      {/* ======== DialogBox ======== */}
      <div ref={dialogRef} className="relative z-10" style={{ minHeight: 180 }}>
        {scene && !isEnding && (
          <DialogBox
            speaker={scene.speaker}
            text={scene.text}
            choices={scene.choices}
            nextSceneId={scene.nextSceneId ?? null}
            onNext={handleNext}
            onChoice={handleChoice}
            isResult={scene.isResult}
            isEnding={scene.isEnding}
          />
        )}

        {/* 엔딩 결과 카드 */}
        {isEnding && scene?.endingData && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <EndingResultCard
              endingData={scene.endingData}
              stats={store.stats}
              groupName={store.groupName}
              members={store.members.map((m) => ({
                name: m.name,
                gender: m.gender,
              }))}
              conceptBoardAssets={store.conceptBoardAssets}
              onShare={handleEndingShare}
              onRestart={handleEndingRestart}
            />
          </div>
        )}
      </div>

      {/* ======== 에너지 모달 ======== */}
      {showEnergyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                에너지 부족
              </h3>
              <button
                onClick={() => setShowEnergyModal(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-1 text-sm text-gray-300">
              오늘 에너지를 모두 사용했어요.
            </p>
            <p className="mb-6 text-sm text-gray-400">
              내일 다시 돌아오면 에너지가 충전돼요.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push('/feed')}
                className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500"
              >
                팬 유니버스 구경하기
              </button>
              <button
                onClick={() => setShowEnergyModal(false)}
                className="w-full rounded-xl border border-white/10 bg-gray-800 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======== CameraDanceModal ======== */}
      <CameraDanceModal
        isOpen={cameraDanceOpen}
        effect={pendingCameraChoice?.choice.effect ?? {}}
        onComplete={handleCameraDanceComplete}
        onClose={() => {
          setCameraDanceOpen(false);
          setChoiceDisabled(false);
          setPendingCameraChoice(null);
        }}
        members={store.members.map((m) => ({
          gender: m.gender,
          customImageUrl: m.customImageUrl,
        }))}
      />

      {/* ======== VirtualStudioPopup ======== */}
      {store.members[0] && (
        <VirtualStudioPopup
          isOpen={virtualStudioOpen}
          memberIndex={0}
          memberName={store.members[0].name}
          memberGender={store.members[0].gender}
          onComplete={handleVirtualStudioComplete}
          onClose={() => setVirtualStudioOpen(false)}
        />
      )}
    </div>
  );
}
