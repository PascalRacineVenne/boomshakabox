import { useCallback, useState } from "react";
import { clamp } from "../../lib/clamp";
import {
  FILTER_MODE_OPTIONS,
  type FilterMode,
  masterFilter,
  setMasterFilterEnvAmount,
} from "../../lib/masterBus";

const DEFAULT_CUTOFF = 12000;
const MIN_CUTOFF = 20;
const MAX_CUTOFF = 12000;
const DEFAULT_RESONANCE = 1;
const MIN_RESONANCE = 0.1;
const MAX_RESONANCE = 20;
const DEFAULT_MODE: FilterMode = FILTER_MODE_OPTIONS.LOWPASS.value;
const DEFAULT_ENV_AMOUNT = 0;

export const useFilterBus = () => {
  const [cutoff, setCutoffState] = useState(DEFAULT_CUTOFF);
  const [resonance, setResonanceState] = useState(DEFAULT_RESONANCE);
  const [mode, setModeState] = useState<FilterMode>(DEFAULT_MODE);
  const [envAmount, setEnvAmountState] = useState(DEFAULT_ENV_AMOUNT);

  const setCutoff = useCallback((value: number) => {
    const clamped = clamp(value, MIN_CUTOFF, MAX_CUTOFF);
    setCutoffState(clamped);
    masterFilter.frequency.rampTo(clamped, 0.02);
  }, []);

  const setResonance = useCallback((value: number) => {
    const clamped = clamp(value, MIN_RESONANCE, MAX_RESONANCE);
    setResonanceState(clamped);
    masterFilter.Q.rampTo(clamped, 0.02);
  }, []);

  const setMode = useCallback((value: FilterMode) => {
    setModeState(value);
    masterFilter.type = value;
  }, []);

  const setEnvAmount = useCallback((value: number) => {
    const clamped = clamp(value, -1, 1);
    setEnvAmountState(clamped);
    setMasterFilterEnvAmount(clamped);
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
    mode,
    setMode,
    envAmount,
    setEnvAmount,
  };
};
