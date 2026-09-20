import { useCallback, useState } from "react";
import { clamp } from "../../lib/clamp";
import {
  FILTER_MODE_OPTIONS,
  type FilterMode,
  masterFilter,
  setMasterFilterEnvAmount,
} from "../../lib/masterBus";

const DEFAULT_CUTOFF = 12000; // Hz
const MIN_CUTOFF = 20;
const MAX_CUTOFF = 12000;
const DEFAULT_RESONANCE = 1; // Tone.Filter.Q
const MIN_RESONANCE = 0.1;
const MAX_RESONANCE = 20;
const DEFAULT_MODE: FilterMode = FILTER_MODE_OPTIONS.LOWPASS.value;
const DEFAULT_ENV_AMOUNT = 0; // -1 to 1, bipolar

/**
 * UI state for the master filter (`lib/masterBus.ts`) — Cutoff, Resonance,
 * and Mode apply continuously to whatever is currently playing, so those
 * setters write straight to the live `masterFilter` node (this project's
 * "sustained" per-track classification, ARCHITECTURE-SPEC.MD): Cutoff/
 * Resonance are AudioParam-backed and ramped to avoid zipper noise, Mode
 * is a plain property assigned directly, same as an envelope's
 * attack/decay. Env Amount instead only matters at the moment of the next
 * hit (it scales a per-hit envelope, see `triggerMasterFilterEnvelope`),
 * so that setter just updates the module-level field `masterBus.ts` reads
 * at trigger time.
 *
 * (No "Keyboard Tracking" control here — see `masterBus.ts` for why it was
 * removed: with no per-step pitch or velocity, it couldn't do anything a
 * different Cutoff setting doesn't already do.)
 *
 * @returns The filter's `cutoff`/`resonance`/`mode`/`envAmount` state and
 * their setters.
 */
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
