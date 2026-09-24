import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

export const STEP_COUNT = 16;

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

const emptyPattern = (): boolean[] => Array(STEP_COUNT).fill(false);

const initialPatterns = (): Record<TrackId, boolean[]> =>
  Object.fromEntries(TRACK_IDS.map((id) => [id, emptyPattern()])) as Record<
    TrackId,
    boolean[]
  >;

const defaultVelocities = (): number[] =>
  Array(STEP_COUNT).fill(DEFAULT_VELOCITY);

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
  const [currentStep, setCurrentStep] = useState(0);

  const voicesRef = useRef(voices);
  useEffect(() => {
    voicesRef.current = voices;
  });

  const stepCountRef = useRef(0);

  useEffect(() => {
    const eventId = Tone.getTransport().scheduleRepeat((time) => {
      const step = stepCountRef.current % STEP_COUNT;
      stepCountRef.current += 1;

      TRACK_IDS.forEach((id) => {
        if (patternsRef.current[id][step]) {
          voicesRef.current[id].trigger(time, velocitiesRef.current[id][step]);
        }
      });

      Tone.getDraw().schedule(() => setCurrentStep(step), time);
    }, "16n");

    const handleTransportStop = () => {
      stepCountRef.current = 0;
      setCurrentStep(0);
    };
    Tone.getTransport().on("stop", handleTransportStop);

    return () => {
      Tone.getTransport().clear(eventId);
      Tone.getTransport().off("stop", handleTransportStop);
    };
  }, []);

  const setStep = (stepIndex: number, active: boolean) => {
    const track = selectedTrack;
    const updated = patternsRef.current[track].slice();
    updated[stepIndex] = active;
    patternsRef.current[track] = updated;

    setPatternsDisplay((prev) => ({ ...prev, [track]: updated }));
  };

  const setVelocity = (stepIndex: number, velocity: number) => {
    const track = selectedTrack;
    const updated = velocitiesRef.current[track].slice();
    updated[stepIndex] = velocity;
    velocitiesRef.current[track] = updated;

    setVelocitiesDisplay((prev) => ({ ...prev, [track]: updated }));
  };

  return {
    patternsDisplay,
    activePattern: patternsDisplay[selectedTrack],
    velocitiesDisplay,
    activeVelocities: velocitiesDisplay[selectedTrack],
    selectedTrack,
    selectTrack: setSelectedTrack,
    currentStep,
    setStep,
    setVelocity,
  };
};
