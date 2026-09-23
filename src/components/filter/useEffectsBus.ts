import { useCallback, useState } from "react";
import { clamp } from "../../lib/clamp";
import {
  effectsDrive,
  effectsDriveTrim,
  effectsFilter,
} from "../../lib/effectsBus";

const DEFAULT_CUTOFF = 12000; // Hz — Moog-style sweeps read best starting mid-range, not wide open
const MIN_CUTOFF = 20;
const MAX_CUTOFF = 12000;
const DEFAULT_RESONANCE = 1; // Tone.Filter.Q
const MIN_RESONANCE = 0.1;
const MAX_RESONANCE = 20;
const DEFAULT_DRIVE = 0; // 0-1, Tone.Distortion amount

/**
 * UI state for the effects bus's current Drive + Filter chain
 * (`lib/effectsBus.ts`) — a stock-Tone.js stand-in for a Moog ladder
 * filter's nonlinear-feedback circuit: `Tone.Filter` with `rolloff: -24`
 * for the correct 4-pole slope, preceded by a `Tone.Distortion` "Drive"
 * stage standing in for that circuit's transistor-stage saturation. See
 * that file for why this tier was chosen over a true per-sample nonlinear
 * model — and for why the bus itself is named generically rather than
 * after this one chain.
 *
 * Cutoff/Resonance/Drive all apply continuously to whatever is currently
 * playing, so these setters write straight to the live nodes (this
 * project's "sustained" per-track classification, ARCHITECTURE-SPEC.MD) —
 * same as `useFilterBus.ts`.
 *
 * Wired into the live master bus in `lib/masterBus.ts`, in series after the
 * original `FilterPanel`'s filter and before the final Volume stage; used
 * by `EffectsPanel.tsx`.
 *
 * @returns The current chain's `cutoff`/`resonance`/`drive` state and
 * their setters.
 */
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
    // Distortion.distortion is a plain property (rebuilds the waveshaper
    // curve), not an AudioParam — direct assignment, same as
    // useMasterBus.ts's own Drive knob.
    effectsDrive.distortion = clamped;
    // Ramp the input trim down as Drive goes up — see effectsBus.ts:
    // a harder distortion curve reads louder even at the same peak level,
    // so this keeps Drive a character control instead of a stealth volume
    // knob. This chain sits in EVERY voice's path (not an optional insert),
    // so an undertrimmed Drive doesn't just sound loud on its own — it
    // forces the master limiter to slam down on the whole mix to
    // compensate. Trimmed harder than a first pass: full Drive now leaves
    // just 15% of the input level (was 40%, still too hot).
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
