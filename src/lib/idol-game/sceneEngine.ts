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

// -- Background image utilities --

const BG_BASE_PATH = '/backgrounds/idol-game';

/**
 * Returns the primary (jpg) background image URL for a given background key.
 */
export function getBgUrl(bgKey: string): string {
  return `${BG_BASE_PATH}/${bgKey}.jpg`;
}

/**
 * Returns the fallback (png) background image URL for a given background key.
 */
export function getFallbackBgUrl(bgKey: string): string {
  return `${BG_BASE_PATH}/${bgKey}.png`;
}

/**
 * img onError handler that switches from .jpg to .png fallback once.
 * Attach this to the onError prop of an <img> element.
 */
export function handleBgImageError(
  e: React.SyntheticEvent<HTMLImageElement>,
  bgKey: string
): void {
  const img = e.currentTarget;
  const fallback = getFallbackBgUrl(bgKey);
  // Only attempt fallback once to avoid infinite loops
  if (!img.src.endsWith(fallback)) {
    img.src = fallback;
  }
}
