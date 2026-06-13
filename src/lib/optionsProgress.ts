import { chapters } from '../data/optionsCourse';
import { usePersistentState } from './storage';

/** Per-chapter quiz result, persisted in localStorage. */
export interface ChapterResult {
  passed: boolean;
  /** Best quiz score so far, as a percentage 0–100. */
  bestPct: number;
}

export type OptionsProgress = Record<string, ChapterResult>;

const PROGRESS_KEY = 'qh:options-progress';
const UNLOCK_ALL_KEY = 'qh:options-unlock-all';

export function useOptionsProgress() {
  return usePersistentState<OptionsProgress>(PROGRESS_KEY, {});
}

/** "Unlock all chapters" override — lets the user skip the gating entirely. */
export function useUnlockAll() {
  return usePersistentState<boolean>(UNLOCK_ALL_KEY, false);
}

/**
 * A chapter is unlocked if the user has opted out of gating, it is the first
 * chapter, or they have passed the immediately preceding chapter's quiz.
 */
export function isUnlocked(id: string, progress: OptionsProgress, unlockAll: boolean): boolean {
  if (unlockAll) return true;
  const idx = chapters.findIndex((c) => c.id === id);
  if (idx <= 0) return true;
  const prev = chapters[idx - 1];
  return Boolean(progress[prev.id]?.passed);
}

/** How many chapters the user has passed. */
export function passedCount(progress: OptionsProgress): number {
  return chapters.filter((c) => progress[c.id]?.passed).length;
}
