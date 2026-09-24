import { useCallback, useState } from "react";
import * as Tone from "tone";
import { clamp } from "../lib/clamp";

const DEFAULT_BPM = 120;
const MIN_BPM = 20;
const MAX_BPM = 300;

export const useTempo = (initialBpm: number = DEFAULT_BPM) => {
  const [bpm, setBpmState] = useState(
    () => Tone.getTransport().bpm.value || initialBpm,
  );

  const setBpm = useCallback((value: number, rampTime = 0.02) => {
    const clamped = clamp(value, MIN_BPM, MAX_BPM);
    setBpmState(clamped);
    Tone.getTransport().bpm.rampTo(clamped, rampTime);
  }, []);

  return { bpm, setBpm, min: MIN_BPM, max: MAX_BPM };
};
