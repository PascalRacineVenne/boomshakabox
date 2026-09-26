// Shared sequencer constants/types with zero dependencies of their own —
// notably no Tone.js import, unlike useStepSequencer.ts (which composes
// useSequencerEngine, and so pulls in Tone just by being imported). Pulling
// these out into their own module lets grid-paging/mini-range-follow/
// pattern-data logic (useGridPaging, useMiniGridFollow, useTrackPatterns)
// be imported and unit-tested without dragging in Tone.js.

export const STEP_COUNT = 16;
export const MAX_STEPS = 64;
export const PATTERN_LENGTH_OPTIONS = [16, 32, 48, 64] as const;
export type PatternLength = (typeof PATTERN_LENGTH_OPTIONS)[number];

export const MINI_GRID_RANGE_SIZE = 32;
export const MINI_GRID_RANGE_COUNT = 2;

export const TRACK_IDS = [
  "kick",
  "snare",
  "clap",
  "hiTom",
  "midTom",
  "lowTom",
  "hihat",
  "hihatOpen",
] as const;
export type TrackId = (typeof TRACK_IDS)[number];

export const TRACK_LABELS: Record<TrackId, string> = {
  kick: "BD",
  snare: "SN",
  clap: "CP",
  hiTom: "HT",
  midTom: "MT",
  lowTom: "LT",
  hihat: "CH",
  hihatOpen: "OH",
};
