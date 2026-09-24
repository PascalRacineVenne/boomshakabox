import { useCallback, useState } from "react";
import { clamp } from "../../lib/clamp";
import {
  effectsDrive,
  effectsDriveTrim,
  effectsFilter,
} from "../../lib/effectsBus";

const DEFAULT_CUTOFF = 12000;
const MIN_CUTOFF = 20;
const MAX_CUTOFF = 12000;
const DEFAULT_RESONANCE = 1;
const MIN_RESONANCE = 0.1;
const MAX_RESONANCE = 20;
const DEFAULT_DRIVE = 0;

export const useEffectsBus = () => {
  const [cutoff, setCutoffState] = useState(DEFAULT_CUTOFF);
  const [resonance, setResonanceState] = useState(DEFAULT_RESONANCE);
  const [drive, setDriveState] = useState(DEFAULT_DRIVE);

  const setCutoff = useCallback((value: number) => {
    const clamped = clamp(value, MIN_CUTOFF, MAX_CUTOFF);
    setCutoffState(clamped);
    effectsFilter.frequency.rampTo(clamped, 0.02);
  }, []);

  const setResonance = useCallback((value: number) => {
    const clamped = clamp(value, MIN_RESONANCE, MAX_RESONANCE);
    setResonanceState(clamped);
    effectsFilter.Q.rampTo(clamped, 0.02);
  }, []);

  const setDrive = useCallback((value: number) => {
    const clamped = clamp(value, 0, 1);
    setDriveState(clamped);

    effectsDrive.distortion = clamped;
    effectsDriveTrim.gain.rampTo(1 - clamped * 0.85, 0.02);
  }, []);

  return {
    cutoff,
    setCutoff,
    minCutoff: MIN_CUTOFF,
    maxCutoff: MAX_CUTOFF,
    resonance,
    setResonance,
    minResonance: MIN_RESONANCE,
    maxResonance: MAX_RESONANCE,
    drive,
    setDrive,
  };
};
