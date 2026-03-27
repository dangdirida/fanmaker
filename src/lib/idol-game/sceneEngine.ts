/**
 * Scene engine for the idol game simulator.
 * Loads scene data from JSON chapter files and provides
 * utilities for scene traversal, stat effects, and background images.
 */

import type React from 'react';

// -- Types --

export interface SceneData {
  id: string;
  chapter: number;
  bg: string;
  spotlight?: boolean;
  titleFlash?: string;
  speaker: string;
  text: string;
  activeMemberIndex?: number;
  visibleMembers?: number[];
  isDancing?: boolean;
  choices?: ChoiceData[];
  nextSceneId?: string;
  isResult?: boolean;
  resultData?: ResultData;
  isEnding?: boolean;
  endingData?: EndingData;
  showVirtualStudioBtn?: boolean;
  showConceptStudioBtn?: boolean;
  requiredFlag?: string;
  energyCost?: number;
}

export interface ChoiceData {
  text: string;
  subText?: string;
  bonusLabel?: string;
  isCamera?: boolean;
  effect?: StatEffect;
  nextSceneId: string;
  setFlags?: Record<string, boolean>;
}

export interface StatEffect {
  vocal?: number;
  dance?: number;
  charm?: number;
  mental?: number;
}

export interface ResultData {
  title: string;
  description: string;
  stageUp?: string;
  weekAdvance?: number;
  unlockFlag?: string;
}

export interface EndingData {
  type: 'legend' | 'award' | 'global' | 'crisis';
  title: string;
  description: string;
  finalStats: boolean;
  unlockedRoutes?: string[];
  shareCardText: string;
}

// -- Scene data imports --

import chapter1Data from '@/data/idol-game/scenes/chapter1.json';
import chapter2Data from '@/data/idol-game/scenes/chapter2.json';
import chapter3Data from '@/data/idol-game/scenes/chapter3.json';
import chapter4Data from '@/data/idol-game/scenes/chapter4.json';
import chapter5Data from '@/data/idol-game/scenes/chapter5.json';
import endingsData from '@/data/idol-game/scenes/endings.json';

const chapter1Scenes = chapter1Data as SceneData[];
const chapter2Scenes = chapter2Data as SceneData[];
const chapter3Scenes = chapter3Data as SceneData[];
const chapter4Scenes = chapter4Data as SceneData[];
const chapter5Scenes = chapter5Data as SceneData[];
const endingScenes = endingsData as SceneData[];

// -- Scene map --
// Combine all chapter scenes into a single lookup map keyed by scene id.

const allScenes: SceneData[] = [
  ...chapter1Scenes,
  ...chapter2Scenes,
  ...chapter3Scenes,
  ...chapter4Scenes,
  ...chapter5Scenes,
  ...endingScenes,
];

const sceneMap = new Map<string, SceneData>();
for (const scene of allScenes) {
  if (scene && scene.id) {
    sceneMap.set(scene.id, scene);
  }
}

// -- Public API --

/**
 * Load a scene by its id.
 * Returns null if no scene with the given id exists.
 */
export function loadScene(sceneId: string): SceneData | null {
  return sceneMap.get(sceneId) ?? null;
}

/**
 * Apply a stat effect to the current stats, clamping all values to 0-100.
 */
export function applyEffect(
  currentStats: { vocal: number; dance: number; charm: number; mental: number },
  effect: StatEffect
): { vocal: number; dance: number; charm: number; mental: number } {
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  return {
    vocal: clamp(currentStats.vocal + (effect.vocal ?? 0)),
    dance: clamp(currentStats.dance + (effect.dance ?? 0)),
    charm: clamp(currentStats.charm + (effect.charm ?? 0)),
    mental: clamp(currentStats.mental + (effect.mental ?? 0)),
  };
}

/**
 * Check whether a required flag is present and truthy in the flags record.
 */
export function checkFlags(
  flags: Record<string, boolean>,
  requiredFlag: string
): boolean {
  return !!flags[requiredFlag];
}

/**
 * Get the next scene id from a scene.
 * If a choiceIndex is provided and the scene has choices, return that choice's nextSceneId.
 * Otherwise fall back to the scene's own nextSceneId.
 * Returns null if there is no next scene.
 */
export function getNextSceneId(
  scene: SceneData,
  choiceIndex?: number
): string | null {
  if (
    choiceIndex !== undefined &&
    scene.choices &&
    scene.choices.length > choiceIndex
  ) {
    return scene.choices[choiceIndex].nextSceneId ?? null;
  }
  return scene.nextSceneId ?? null;
}

// -- Ending resolution --

export interface GameStats {
  vocal: number;
  dance: number;
  charm: number;
  mental: number;
}

/**
 * Resolve which ending scene to navigate to based on final stats.
 * Called when a scene has isResult: true and the player clicks "결과 확인".
 */
export function resolveResultEnding(stats: GameStats): string {
  const total = stats.vocal + stats.dance + stats.charm + stats.mental;
  const isHighVocal = stats.vocal >= 75;
  const isHighDance = stats.dance >= 75;
  const isHighCharm = stats.charm >= 75;
  const isAllHigh = total >= 280;

  if (isAllHigh) return 'ending_legend';
  if (total >= 240) return 'ending_first_place';
  if (isHighCharm && stats.dance < 60) return 'ending_variety';
  if (isHighVocal && stats.dance < 60) return 'ending_artistry';
  if (isHighDance && stats.charm < 60) return 'ending_global';
  if (isHighVocal && isHighDance && stats.charm < 60) return 'ending_solo';
  if (total >= 200) return 'ending_global';
  return 'ending_rebuild';
}

// -- Background image utilities --

const BG_BASE_PATH = '/backgrounds/idol-game';

/**
 * 씬 bg 키 -> 실제 파일명 매핑.
 * 파일이 없는 키는 가장 비슷한 기존 파일로 대체.
 *
 * 실제 파일:
 *   conference_room.jpg, practice_room.jpg, practice_room_night.jpg,
 *   dorm_room.jpg, dorm_room_night.jpg
 */
const BG_FILE_MAP: Record<string, string> = {
  // 직접 매핑
  conference: 'conference_room',
  practice: 'practice_room',
  practice_night: 'practice_room_night',
  dorm: 'dorm_room',
  dorm_night: 'dorm_room_night',
  office_night: 'conference_room',
  stage: 'practice_room_night',
  conference_room: 'conference_room',
  practice_room: 'practice_room',
  // 파일 미보유 - 유사 배경으로 대체
  eval_hall: 'conference_room',
  backstage: 'practice_room_night',
  music_show: 'practice_room',
  concert: 'practice_room_night',
  debut_stage: 'practice_room_night',
  recording: 'dorm_room',
  photo_studio: 'dorm_room',
  airport: 'conference_room',
  overseas: 'practice_room_night',
  award: 'conference_room',
  award_win: 'conference_room',
  rooftop: 'dorm_room_night',
  press: 'conference_room',
  sns_viral: 'dorm_room',
  crisis_stage: 'practice_room_night',
};

function resolveFilename(bgKey: string): string {
  return BG_FILE_MAP[bgKey] ?? bgKey;
}

/**
 * Returns the background image URL for a given scene bg key.
 * Resolves the key to the actual filename first.
 */
export function getBgUrl(bgKey: string): string {
  return `${BG_BASE_PATH}/${resolveFilename(bgKey)}.jpg`;
}

/**
 * Returns the fallback (png) background image URL.
 */
export function getFallbackBgUrl(bgKey: string): string {
  return `${BG_BASE_PATH}/${resolveFilename(bgKey)}.png`;
}

/**
 * CSS gradient fallback map for when background images fail to load.
 */
const BG_GRADIENT_MAP: Record<string, string> = {
  office_night: 'linear-gradient(to bottom, #1a1a2e, #0a0a1a)',
  practice: 'linear-gradient(to bottom, #1a0a35, #0a1528)',
  practice_night: 'linear-gradient(to bottom, #1a0a35, #0a1528)',
  stage: 'linear-gradient(to bottom, #200040, #000)',
  debut_stage: 'linear-gradient(to bottom, #200040, #000)',
  concert: 'linear-gradient(to bottom, #200040, #000)',
  music_show: 'linear-gradient(to bottom, #200040, #000)',
  conference: 'linear-gradient(to bottom, #1a1a2e, #0f0f1a)',
  eval_hall: 'linear-gradient(to bottom, #1a1a2e, #0f0f1a)',
  press: 'linear-gradient(to bottom, #1a1a2e, #0f0f1a)',
  dorm: 'linear-gradient(to bottom, #0a0a1a, #1a0a2e)',
  dorm_night: 'linear-gradient(to bottom, #0a0a1a, #1a0a2e)',
  rooftop: 'linear-gradient(to bottom, #0a0a1a, #1a0a2e)',
  airport: 'linear-gradient(to bottom, #0a1a2e, #1a2e0a)',
  overseas: 'linear-gradient(to bottom, #0a1a2e, #1a2e0a)',
  award: 'linear-gradient(to bottom, #2e1a00, #1a0a00)',
  award_win: 'linear-gradient(to bottom, #2e1a00, #1a0a00)',
  crisis_stage: 'linear-gradient(to bottom, #0a0a0a, #1a0a0a)',
  sns_viral: 'linear-gradient(to bottom, #0a0a0a, #1a0a0a)',
  backstage: 'linear-gradient(to bottom, #0a0a0a, #1a0a0a)',
  recording: 'linear-gradient(to bottom, #0a0a0a, #1a0a0a)',
  photo_studio: 'linear-gradient(to bottom, #0a0a0a, #1a0a0a)',
};

export function getBgGradient(bgKey: string): string {
  return BG_GRADIENT_MAP[bgKey] ?? 'linear-gradient(to bottom, #0a0a1a, #1a0a2e)';
}

/**
 * img onError handler that switches from .jpg to .png fallback once,
 * then hides the image on second failure so the CSS gradient shows through.
 */
export function handleBgImageError(
  e: React.SyntheticEvent<HTMLImageElement>,
  bgKey: string
): void {
  const img = e.currentTarget;
  const fallback = getFallbackBgUrl(bgKey);
  if (!img.src.endsWith(fallback)) {
    img.src = fallback;
  } else {
    img.style.display = 'none';
  }
}
