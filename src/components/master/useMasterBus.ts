import { useCallback, useState } from "react";
import { clamp } from "../../lib/clamp";
import { masterGain } from "../../lib/masterBus";

const DEFAULT_VOLUME = 75; // 0-100%, matches the per-voice Volume slider convention

/**
 * UI state for the master bus (`lib/masterBus.ts`) — just overall Volume.
 * (There used to be a Drive amount/on-off here too — removed once the
 * effects bus's own Drive, `useEffectsBus.ts`, became the one drive
 * control worth keeping.) Volume applies continuously to whatever is
 * currently playing rather than "on the next trigger," so its setter
 * writes straight to the live node (this project's "sustained" per-track
 * classification, ARCHITECTURE-SPEC.MD), not just to a ref read by a
 * scheduler.
 *
 * @returns The master `volume` state and its setter.
 */
export const useMasterBus = () => {
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);

  const setVolume = useCallback((value: number) => {
    const clamped = clamp(value, 0, 100);
    setVolumeState(clamped);
    // volume is a live AudioParam (Tone.Gain.gain) — ramp rather than
    // jump, same "no zipper noise" rule as useTempo's bpm.rampTo.
    masterGain.gain.rampTo(clamped / 100, 0.02);
  }, []);

  return {
    volume,
    setVolume,
  };
};
