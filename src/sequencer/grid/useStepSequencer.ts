import { useEffect, useRef, useState } from "react";
import { useTrackPatterns } from "../engine/useTrackPatterns";
import { useSequencerEngine, type Voices } from "../engine/useSequencerEngine";

export const STEP_COUNT = 16;
export const MAX_STEPS = 64;
export const PATTERN_LENGTH_OPTIONS = [16, 32, 48, 64] as const;
export type PatternLength = (typeof PATTERN_LENGTH_OPTIONS)[number];

export const MINI_GRID_RANGE_SIZE = 32;
export const MINI_GRID_RANGE_COUNT = 2;

export const TRACK_IDS = [
  "kick",
  "snare",
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
  hiTom: "HT",
  midTom: "MT",
  lowTom: "LT",
  hihat: "CH",
  hihatOpen: "OH",
};

const noSequencerHits = (): Record<TrackId, boolean> =>
  Object.fromEntries(TRACK_IDS.map((id) => [id, false])) as Record<
    TrackId,
    boolean
  >;

const DEFAULT_LENGTH: PatternLength = 16;
const SEQUENCER_HIT_FLASH_MS = 60;

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

  const [length, setLength] = useState<PatternLength>(DEFAULT_LENGTH);

  const [viewedRange, setViewedRange] = useState(0);

  const [miniRange, setMiniRange] = useState(0);
  const [miniAutoFollow, setMiniAutoFollow] = useState(true);
  const miniAutoFollowRef = useRef(miniAutoFollow);
  useEffect(() => {
    miniAutoFollowRef.current = miniAutoFollow;
  }, [miniAutoFollow]);

  const [sequencerHits, setSequencerHits] = useState(noSequencerHits);
  const flashTimeoutsRef = useRef(
    {} as Record<TrackId, ReturnType<typeof setTimeout> | undefined>,
  );

  const flashHit = (id: TrackId) => {
    clearTimeout(flashTimeoutsRef.current[id]);
    setSequencerHits((prev) => ({ ...prev, [id]: true }));
    flashTimeoutsRef.current[id] = setTimeout(() => {
      setSequencerHits((prev) => ({ ...prev, [id]: false }));
    }, SEQUENCER_HIT_FLASH_MS);
  };

  useEffect(() => {
    const flashTimeouts = flashTimeoutsRef.current;
    return () => {
      TRACK_IDS.forEach((id) => clearTimeout(flashTimeouts[id]));
    };
  }, []);

  const { currentStep } = useSequencerEngine({
    trackIds: TRACK_IDS,
    voices,
    patternsRef,
    velocitiesRef,
    length,
    onStepHit: (step, hitTrackIds) => {
      hitTrackIds.forEach((id) => flashHit(id));
      if (miniAutoFollowRef.current) {
        setMiniRange(Math.floor(step / MINI_GRID_RANGE_SIZE));
      }
    },
    onStop: () => {
      const flashTimeouts = flashTimeoutsRef.current;
      TRACK_IDS.forEach((id) => clearTimeout(flashTimeouts[id]));
      setSequencerHits(noSequencerHits());
      if (miniAutoFollowRef.current) setMiniRange(0);
    },
  });

  const setStep = (rangeStepIndex: number, active: boolean) => {
    setAbsoluteStep(viewedRange * STEP_COUNT + rangeStepIndex, active);
  };

  const setVelocity = (rangeStepIndex: number, velocity: number) => {
    setAbsoluteVelocity(viewedRange * STEP_COUNT + rangeStepIndex, velocity);
  };

  const changeLength = (nextLength: PatternLength) => {
    setLength(nextLength);
    const maxRange = nextLength / STEP_COUNT - 1;
    setViewedRange((prev) => Math.min(prev, maxRange));
  };

  const goToMiniRange = (range: number) => {
    setMiniRange(range);
    setMiniAutoFollow(range === Math.floor(currentStep / MINI_GRID_RANGE_SIZE));
  };

  const rangeStart = viewedRange * STEP_COUNT;

  return {
    patternsDisplay,
    activePattern: patternsDisplay[selectedTrack].slice(
      rangeStart,
      rangeStart + STEP_COUNT,
    ),
    velocitiesDisplay,
    activeVelocities: velocitiesDisplay[selectedTrack].slice(
      rangeStart,
      rangeStart + STEP_COUNT,
    ),
    selectedTrack,
    selectTrack,
    currentStep,
    setStep,
    setVelocity,
    clearTrack,
    length,
    setLength: changeLength,
    viewedRange,
    goToRange: setViewedRange,
    miniRange,
    goToMiniRange,
    sequencerHits,
  };
};
