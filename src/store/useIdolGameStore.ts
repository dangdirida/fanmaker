import { create } from 'zustand';

// -- Types --

export interface Member {
  id: string;
  name: string;
  gender: 'female' | 'male';
  customImageUrl?: string;
}

export interface IdolGameState {
  // Game state
  groupName: string;
  groupType: 'girl' | 'boy' | 'mixed';
  concept: string;
  members: Member[];
  stats: { vocal: number; dance: number; charm: number; mental: number };
  stage: string;
  week: number;
  energy: number;
  currentSceneId: string;
  flags: Record<string, boolean>;
  choiceHistory: string[];
  conceptBoardAssets: { logoUrl?: string; coverUrl?: string };
  playtimeMinutes: number;

  // UI state
  isTransitioning: boolean;
  showSaveToast: boolean;
  statChanges: {
    vocal?: number;
    dance?: number;
    charm?: number;
    mental?: number;
  } | null;
  showEnergyModal: boolean;

  // Actions
  setGroupInfo: (info: {
    groupName: string;
    groupType: 'girl' | 'boy' | 'mixed';
    concept: string;
    memberCount: number;
  }) => void;
  setMembers: (members: Member[]) => void;
  updateMemberGender: (index: number, gender: 'female' | 'male') => void;
  updateMemberName: (index: number, name: string) => void;
  updateMemberImage: (index: number, url: string) => void;
  applyEffect: (effect: {
    vocal?: number;
    dance?: number;
    charm?: number;
    mental?: number;
  }) => void;
  setCurrentScene: (sceneId: string) => void;
  setFlags: (flags: Record<string, boolean>) => void;
  addChoiceHistory: (choiceId: string) => void;
  setStage: (stage: string) => void;
  advanceWeek: (amount: number) => void;
  setEnergy: (energy: number) => void;
  consumeEnergy: (amount: number) => void;
  setConceptBoardAssets: (assets: {
    logoUrl?: string;
    coverUrl?: string;
  }) => void;
  setIsTransitioning: (val: boolean) => void;
  setShowSaveToast: (val: boolean) => void;
  setStatChanges: (
    changes: {
      vocal?: number;
      dance?: number;
      charm?: number;
      mental?: number;
    } | null
  ) => void;
  setShowEnergyModal: (val: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadFromSave: (save: any) => void;
  resetGame: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSavePayload: () => any;
}

// -- Helpers --

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampStats(stats: {
  vocal: number;
  dance: number;
  charm: number;
  mental: number;
}) {
  return {
    vocal: clamp(stats.vocal, 0, 100),
    dance: clamp(stats.dance, 0, 100),
    charm: clamp(stats.charm, 0, 100),
    mental: clamp(stats.mental, 0, 100),
  };
}

// -- Initial values --

const INITIAL_STATS = { vocal: 60, dance: 60, charm: 60, mental: 60 };

const INITIAL_STATE = {
  groupName: '',
  groupType: 'girl' as const,
  concept: '',
  members: [] as Member[],
  stats: { ...INITIAL_STATS },
  stage: 'trainee',
  week: 1,
  energy: 100,
  currentSceneId: '',
  flags: {} as Record<string, boolean>,
  choiceHistory: [] as string[],
  conceptBoardAssets: {} as { logoUrl?: string; coverUrl?: string },
  playtimeMinutes: 0,

  isTransitioning: false,
  showSaveToast: false,
  statChanges: null as IdolGameState['statChanges'],
  showEnergyModal: false,
};

// -- Store --

export const useIdolGameStore = create<IdolGameState>((set, get) => ({
  ...INITIAL_STATE,

  setGroupInfo: (info) => {
    const members: Member[] = Array.from({ length: info.memberCount }, (_, i) => ({
      id: `member-${i + 1}`,
      name: `Member ${i + 1}`,
      gender: info.groupType === 'boy' ? 'male' : 'female',
    }));
    set({
      groupName: info.groupName,
      groupType: info.groupType,
      concept: info.concept,
      members,
    });
  },

  setMembers: (members) => set({ members }),

  updateMemberGender: (index, gender) => {
    const members = [...get().members];
    if (members[index]) {
      members[index] = { ...members[index], gender };
      set({ members });
    }
  },

  updateMemberName: (index, name) => {
    const members = [...get().members];
    if (members[index]) {
      members[index] = { ...members[index], name };
      set({ members });
    }
  },

  updateMemberImage: (index, url) => {
    const members = [...get().members];
    if (members[index]) {
      members[index] = { ...members[index], customImageUrl: url };
      set({ members });
    }
  },

  applyEffect: (effect) => {
    const { stats } = get();
    const newStats = clampStats({
      vocal: stats.vocal + (effect.vocal ?? 0),
      dance: stats.dance + (effect.dance ?? 0),
      charm: stats.charm + (effect.charm ?? 0),
      mental: stats.mental + (effect.mental ?? 0),
    });
    set({ stats: newStats });
  },

  setCurrentScene: (sceneId) => set({ currentSceneId: sceneId }),

  setFlags: (flags) =>
    set({ flags: { ...get().flags, ...flags } }),

  addChoiceHistory: (choiceId) =>
    set({ choiceHistory: [...get().choiceHistory, choiceId] }),

  setStage: (stage) => set({ stage }),

  advanceWeek: (amount) =>
    set({ week: get().week + amount }),

  setEnergy: (energy) => set({ energy: clamp(energy, 0, 100) }),

  consumeEnergy: (amount) => {
    const newEnergy = clamp(get().energy - amount, 0, 100);
    set({ energy: newEnergy });
  },

  setConceptBoardAssets: (assets) =>
    set({ conceptBoardAssets: { ...get().conceptBoardAssets, ...assets } }),

  setIsTransitioning: (val) => set({ isTransitioning: val }),

  setShowSaveToast: (val) => set({ showSaveToast: val }),

  setStatChanges: (changes) => set({ statChanges: changes }),

  setShowEnergyModal: (val) => set({ showEnergyModal: val }),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadFromSave: (save: any) => {
    if (!save) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parseSafe = (val: any, fallback: any) => {
      if (!val) return fallback;
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return fallback;
        }
      }
      return val;
    };

    set({
      groupName: save.groupName ?? '',
      groupType: save.groupType ?? 'girl',
      concept: save.concept ?? '',
      members: parseSafe(save.membersJson ?? save.members, []),
      stats: parseSafe(save.statsJson ?? save.stats, { ...INITIAL_STATS }),
      stage: save.stage ?? 'trainee',
      week: save.week ?? 1,
      energy: save.energy ?? 100,
      currentSceneId: save.currentSceneId ?? '',
      flags: parseSafe(save.flagsJson ?? save.flags, {}),
      choiceHistory: parseSafe(save.choiceHistoryJson ?? save.choiceHistory, []),
      conceptBoardAssets: parseSafe(
        save.conceptBoardJson ?? save.conceptBoardAssets,
        {}
      ),
      playtimeMinutes: save.playtimeMinutes ?? 0,
    });
  },

  resetGame: () => set({ ...INITIAL_STATE, stats: { ...INITIAL_STATS } }),

  getSavePayload: () => {
    const state = get();
    return {
      groupName: state.groupName,
      groupType: state.groupType,
      concept: state.concept,
      membersJson: JSON.stringify(state.members),
      statsJson: JSON.stringify(state.stats),
      stage: state.stage,
      week: state.week,
      energy: state.energy,
      currentSceneId: state.currentSceneId,
      flagsJson: JSON.stringify(state.flags),
      choiceHistoryJson: JSON.stringify(state.choiceHistory),
      conceptBoardJson: JSON.stringify(state.conceptBoardAssets),
      playtimeMinutes: state.playtimeMinutes,
    };
  },
}));
