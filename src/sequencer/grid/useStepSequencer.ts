import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

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

type TriggerFn = (scheduledTime?: number, velocity?: number) => void;

type Voices = Record<TrackId, { trigger: TriggerFn }>;

const noSequencerHits = (): Record<TrackId, boolean> =>
  Object.fromEntries(TRACK_IDS.map((id) => [id, false])) as Record<
    TrackId,
    boolean
  >;

const DEFAULT_VELOCITY = 80;
const DEFAULT_LENGTH: PatternLength = 16;
const SEQUENCER_HIT_FLASH_MS = 60;

const emptyPattern = (): boolean[] => Array(MAX_STEPS).fill(false);

const initialPatterns = (): Record<TrackId, boolean[]> =>
  Object.fromEntries(TRACK_IDS.map((id) => [id, emptyPattern()])) as Record<
    TrackId,
    boolean[]
  >;

const defaultVelocities = (): number[] =>
  Array(MAX_STEPS).fill(DEFAULT_VELOCITY);

const initialVelocities = (): Record<TrackId, number[]> =>
  Object.fromEntries(
    TRACK_IDS.map((id) => [id, defaultVelocities()]),
  ) as Record<TrackId, number[]>;

export const useStepSequencer = (voices: Voices) => {
  const patternsRef = useRef<Record<TrackId, boolean[]>>(initialPatterns());
  const [patternsDisplay, setPatternsDisplay] =
    useState<Record<TrackId, boolean[]>>(initialPatterns);

  const velocitiesRef = useRef<Record<TrackId, number[]>>(initialVelocities());
  const [velocitiesDisplay, setVelocitiesDisplay] =
    useState<Record<TrackId, number[]>>(initialVelocities);

  const [selectedTrack, setSelectedTrack] = useState<TrackId>(TRACK_IDS[0]);
  const [currentStep, setCurrentStep] = useState(0); // global index, 0..length-1

  const [length, setLength] = useState<PatternLength>(DEFAULT_LENGTH);
  const lengthRef = useRef(length);
  useEffect(() => {
    lengthRef.current = length;
  }, [length]);

  const [viewedRange, setViewedRange] = useState(0);

  const [miniRange, setMiniRange] = useState(0);
  const [miniAutoFollow, setMiniAutoFollow] = useState(true);
  const miniAutoFollowRef = useRef(miniAutoFollow);
  useEffect(() => {
    miniAutoFollowRef.current = miniAutoFollow;
  }, [miniAutoFollow]);

  const voicesRef = useRef(voices);
  useEffect(() => {
    voicesRef.current = voices;
  });

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

  const stepCountRef = useRef(0);

  useEffect(() => {
    const flashTimeouts = flashTimeoutsRef.current;
    const eventId = Tone.getTransport().scheduleRepeat((time) => {
      const step = stepCountRef.current % lengthRef.current;
      stepCountRef.current += 1;

      TRACK_IDS.forEach((id) => {
        if (patternsRef.current[id][step]) {
          voicesRef.current[id].trigger(time, velocitiesRef.current[id][step]);
        }
      });

      Tone.getDraw().schedule(() => {
        setCurrentStep(step);
        TRACK_IDS.forEach((id) => {
          if (patternsRef.current[id][step]) flashHit(id);
        });
        if (miniAutoFollowRef.current) {
          setMiniRange(Math.floor(step / MINI_GRID_RANGE_SIZE));
        }
      }, time);
    }, "16n");

    const handleTransportStop = () => {
      stepCountRef.current = 0;
      setCurrentStep(0);
      TRACK_IDS.forEach((id) => clearTimeout(flashTimeouts[id]));
      setSequencerHits(noSequencerHits());
      if (miniAutoFollowRef.current) setMiniRange(0);
    };
    Tone.getTransport().on("stop", handleTransportStop);

    return () => {
      Tone.getTransport().clear(eventId);
      Tone.getTransport().off("stop", handleTransportStop);
      TRACK_IDS.forEach((id) => clearTimeout(flashTimeouts[id]));
    };
  }, []);

  const setStep = (rangeStepIndex: number, active: boolean) => {
    const track = selectedTrack;
    const absoluteIndex = viewedRange * STEP_COUNT + rangeStepIndex;
    const updated = patternsRef.current[track].slice();
    updated[absoluteIndex] = active;
    patternsRef.current[track] = updated;

    setPatternsDisplay((prev) => ({ ...prev, [track]: updated }));
  };

  const setVelocity = (rangeStepIndex: number, velocity: number) => {
    const track = selectedTrack;
    const absoluteIndex = viewedRange * STEP_COUNT + rangeStepIndex;
    const updated = velocitiesRef.current[track].slice();
    updated[absoluteIndex] = velocity;
    velocitiesRef.current[track] = updated;

    setVelocitiesDisplay((prev) => ({ ...prev, [track]: updated }));
  };

  const clearTrack = () => {
    const track = selectedTrack;

    patternsRef.current[track] = emptyPattern();
    setPatternsDisplay((prev) => ({ ...prev, [track]: emptyPattern() }));

    velocitiesRef.current[track] = defaultVelocities();
    setVelocitiesDisplay((prev) => ({ ...prev, [track]: defaultVelocities() }));
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
    selectTrack: setSelectedTrack,
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
