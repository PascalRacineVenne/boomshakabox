import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

export const STEP_COUNT = 16; // steps shown per page in the grid
export const MAX_STEPS = 64; // patterns always allocate this many steps, independent of the active length
export const PATTERN_LENGTH_OPTIONS = [16, 32, 48, 64] as const;
export type PatternLength = (typeof PATTERN_LENGTH_OPTIONS)[number];

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

const DEFAULT_VELOCITY = 80;
const DEFAULT_LENGTH: PatternLength = 16;

// Always allocate the full 64 steps, regardless of the active length, so
// shrinking length (e.g. 64 -> 16) only hides/excludes steps 17-64 from
// the grid and playback rather than deleting their programmed data —
// growing back restores whatever was already there.
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

  // Pattern length is global (shared by every voice), not per-track.
  const [length, setLength] = useState<PatternLength>(DEFAULT_LENGTH);
  const lengthRef = useRef(length);
  useEffect(() => {
    lengthRef.current = length;
  }, [length]);

  // Which page (0-3) the grid is currently showing, and whether it should
  // keep jumping to follow the playhead automatically.
  const [viewedPage, setViewedPage] = useState(0);
  const [autoFollow, setAutoFollow] = useState(true);
  const autoFollowRef = useRef(autoFollow);
  useEffect(() => {
    autoFollowRef.current = autoFollow;
  }, [autoFollow]);

  const voicesRef = useRef(voices);
  useEffect(() => {
    voicesRef.current = voices;
  });

  const stepCountRef = useRef(0);

  useEffect(() => {
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
        if (autoFollowRef.current) {
          setViewedPage(Math.floor(step / STEP_COUNT));
        }
      }, time);
    }, "16n");

    const handleTransportStop = () => {
      stepCountRef.current = 0;
      setCurrentStep(0);
      if (autoFollowRef.current) setViewedPage(0);
    };
    Tone.getTransport().on("stop", handleTransportStop);

    return () => {
      Tone.getTransport().clear(eventId);
      Tone.getTransport().off("stop", handleTransportStop);
    };
  }, []);

  const setStep = (pageStepIndex: number, active: boolean) => {
    const track = selectedTrack;
    const absoluteIndex = viewedPage * STEP_COUNT + pageStepIndex;
    const updated = patternsRef.current[track].slice();
    updated[absoluteIndex] = active;
    patternsRef.current[track] = updated;

    setPatternsDisplay((prev) => ({ ...prev, [track]: updated }));
  };

  const setVelocity = (pageStepIndex: number, velocity: number) => {
    const track = selectedTrack;
    const absoluteIndex = viewedPage * STEP_COUNT + pageStepIndex;
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

  // Shrinking length can leave viewedPage pointing past the new last page.
  const changeLength = (nextLength: PatternLength) => {
    setLength(nextLength);
    const maxPage = nextLength / STEP_COUNT - 1;
    setViewedPage((prev) => Math.min(prev, maxPage));
  };

  // The one action behind both page tabs and the overview strip: view that
  // page, and only keep auto-follow on if it's the page the playhead is
  // actually on right now — clicking away from the live page is what turns
  // auto-follow off, and clicking back onto it is what turns it back on.
  const goToPage = (page: number) => {
    setViewedPage(page);
    setAutoFollow(page === Math.floor(currentStep / STEP_COUNT));
  };

  const pageStart = viewedPage * STEP_COUNT;

  return {
    patternsDisplay,
    activePattern: patternsDisplay[selectedTrack].slice(
      pageStart,
      pageStart + STEP_COUNT,
    ),
    velocitiesDisplay,
    activeVelocities: velocitiesDisplay[selectedTrack].slice(
      pageStart,
      pageStart + STEP_COUNT,
    ),
    selectedTrack,
    selectTrack: setSelectedTrack,
    currentStep,
    setStep,
    setVelocity,
    clearTrack,
    length,
    setLength: changeLength,
    viewedPage,
    goToPage,
    autoFollow,
  };
};
