import { useTrackPatterns } from "../engine/useTrackPatterns";
import { useSequencerEngine, type Voices } from "../engine/useSequencerEngine";
import { useSequencerHitFlash } from "../engine/useSequencerHitFlash";
import { useGridPaging } from "./useGridPaging";
import { useMiniGridFollow } from "./useMiniGridFollow";

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

export const useStepSequencer = (voices: Voices) => {
  const {
    patternsRef,
    patternsDisplay,
    velocitiesRef,
    velocitiesDisplay,
    selectedTrack,
    selectTrack,
    setStep: setAbsoluteStep,
    setVelocity: setAbsoluteVelocity,
    clearTrack,
  } = useTrackPatterns();

  const {
    length,
    setLength,
    viewedRange,
    goToRange,
    rangeStart,
    activePattern,
    activeVelocities,
  } = useGridPaging({ patternsDisplay, velocitiesDisplay, selectedTrack });

  const hitFlash = useSequencerHitFlash(TRACK_IDS);

  const { currentStep } = useSequencerEngine({
    trackIds: TRACK_IDS,
    voices,
    patternsRef,
    velocitiesRef,
    length,
    onStepHit: (_step, hitTrackIds) => {
      hitFlash.reportHit(hitTrackIds);
    },
    onStop: () => {
      hitFlash.reset();
      miniGridFollow.reset();
    },
  });

  const miniGridFollow = useMiniGridFollow(currentStep);

  const setStep = (rangeStepIndex: number, active: boolean) => {
    setAbsoluteStep(rangeStart + rangeStepIndex, active);
  };

  const setVelocity = (rangeStepIndex: number, velocity: number) => {
    setAbsoluteVelocity(rangeStart + rangeStepIndex, velocity);
  };

  return {
    patternsDisplay,
    activePattern,
    velocitiesDisplay,
    activeVelocities,
    selectedTrack,
    selectTrack,
    currentStep,
    setStep,
    setVelocity,
    clearTrack,
    length,
    setLength,
    viewedRange,
    goToRange,
    miniRange: miniGridFollow.miniRange,
    goToMiniRange: miniGridFollow.goToMiniRange,
    sequencerHits: hitFlash.sequencerHits,
  };
};
