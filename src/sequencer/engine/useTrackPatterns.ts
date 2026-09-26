import { useRef, useState } from "react";
import { MAX_STEPS, TRACK_IDS, type TrackId } from "../grid/useStepSequencer";

const DEFAULT_VELOCITY = 80;

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

export const useTrackPatterns = () => {
  const patternsRef = useRef<Record<TrackId, boolean[]>>(initialPatterns());
  const [patternsDisplay, setPatternsDisplay] =
    useState<Record<TrackId, boolean[]>>(initialPatterns);

  const velocitiesRef = useRef<Record<TrackId, number[]>>(initialVelocities());
  const [velocitiesDisplay, setVelocitiesDisplay] =
    useState<Record<TrackId, number[]>>(initialVelocities);

  const [selectedTrack, setSelectedTrack] = useState<TrackId>(TRACK_IDS[0]);

  const setStep = (absoluteIndex: number, active: boolean) => {
    const track = selectedTrack;
    const updated = patternsRef.current[track].slice();
    updated[absoluteIndex] = active;
    patternsRef.current[track] = updated;

    setPatternsDisplay((prev) => ({ ...prev, [track]: updated }));
  };

  const setVelocity = (absoluteIndex: number, velocity: number) => {
    const track = selectedTrack;
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
    setVelocitiesDisplay((prev) => ({
      ...prev,
      [track]: defaultVelocities(),
    }));
  };

  return {
    patternsRef,
    patternsDisplay,
    velocitiesRef,
    velocitiesDisplay,
    selectedTrack,
    selectTrack: setSelectedTrack,
    setStep,
    setVelocity,
    clearTrack,
  };
};
