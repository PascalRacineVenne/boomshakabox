import { useCallback, useState } from "react";
import { clamp } from "../../lib/clamp";
import {
  masterFilter,
  setMasterFilterEnvAmount,
  setMasterFilterKeyboardTracking,
} from "../../lib/masterBus";

export type FilterMode = "lowpass" | "highpass" | "bandpass";

const DEFAULT_CUTOFF = 12000; // Hz
const MIN_CUTOFF = 20;
const MAX_CUTOFF = 12000;
const DEFAULT_RESONANCE = 1; // Tone.Filter.Q
const MIN_RESONANCE = 0.1;
const MAX_RESONANCE = 20;
const DEFAULT_MODE: FilterMode = "lowpass";
const DEFAULT_ENV_AMOUNT = 0; // -1 to 1, bipolar
const DEFAULT_KEYBOARD_TRACKING = 0; // 0 to 1

/**
 * UI state for the master filter (`lib/masterBus.ts`) — Cutoff, Resonance,
 * and Mode apply continuously to whatever is currently playing, so those
 * setters write straight to the live `masterFilter` node (this project's
 * "sustained" per-track classification, ARCHITECTURE-SPEC.MD): Cutoff/
 * Resonance are AudioParam-backed and ramped to avoid zipper noise, Mode
 * is a plain property assigned directly, same as an envelope's
 * attack/decay. Env Amount and Keyboard Tracking instead only matter at
 * the moment of the next hit (they scale a per-hit envelope, see
 * `triggerMasterFilterEnvelope`), so those setters just update the
 * module-level fields `masterBus.ts` reads at trigger time.
 *
 * @returns The filter's `cutoff`/`resonance`/`mode`/`envAmount`/
 * `keyboardTracking` state and their setters.
 */
export const useFilterBus = () => {
  const [cutoff, setCutoffState] = useState(DEFAULT_CUTOFF);
  const [resonance, setResonanceState] = useState(DEFAULT_RESONANCE);
  const [mode, setModeState] = useState<FilterMode>(DEFAULT_MODE);
  const [envAmount, setEnvAmountState] = useState(DEFAULT_ENV_AMOUNT);
  const [keyboardTracking, setKeyboardTrackingState] = useState(DEFAULT_KEYBOARD_TRACKING);

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

  const setKeyboardTracking = useCallback((value: number) => {
    const clamped = clamp(value, 0, 1);
    setKeyboardTrackingState(clamped);
    setMasterFilterKeyboardTracking(clamped);
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
    keyboardTracking,
    setKeyboardTracking,
  };
};
