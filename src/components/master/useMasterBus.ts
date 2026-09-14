import { useCallback, useState } from "react";
import { clamp } from "../../lib/clamp";
import { masterDistortion, masterGain } from "../../lib/masterBus";

const DEFAULT_VOLUME = 75; // 0-100%, matches the per-voice Volume slider convention
const DEFAULT_DISTORTION = 0.4; // 0-1, Tone.Distortion's own amount range

/**
 * UI state for the master bus (`lib/masterBus.ts`) — volume and drive
 * amount/on-off. Unlike a drum voice's knobs, these apply continuously to
 * whatever is currently playing rather than "on the next trigger," so
 * every setter here writes straight to the live node (this project's
 * "sustained" per-track classification, ARCHITECTURE-SPEC.MD), not just to
 * a ref read by a scheduler.
 *
 * @returns The master `volume`/`distortion`/`distortionOn` state and their
 * setters.
 */
export const useMasterBus = () => {
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [distortion, setDistortionState] = useState(DEFAULT_DISTORTION);
  const [distortionOn, setDistortionOnState] = useState(false);

  const setVolume = useCallback((value: number) => {
    const clamped = clamp(value, 0, 100);
    setVolumeState(clamped);
    // volume is a live AudioParam (Tone.Gain.gain) — ramp rather than
    // jump, same "no zipper noise" rule as useTempo's bpm.rampTo.
    masterGain.gain.rampTo(clamped / 100, 0.02);
  }, []);

  const setDistortion = useCallback((value: number) => {
    const clamped = clamp(value, 0, 1);
    setDistortionState(clamped);
    // Distortion.distortion is a plain property (rebuilds the waveshaper
    // curve), not an AudioParam — direct assignment is correct here, same
    // as an envelope's attack/decay in ARCHITECTURE-SPEC.MD.
    masterDistortion.distortion = clamped;
  }, []);

  const setDistortionOn = useCallback((value: boolean) => {
    setDistortionOnState(value);
    masterDistortion.wet.rampTo(value ? 1 : 0, 0.02);
  }, []);

  return {
    volume,
    setVolume,
    distortion,
    setDistortion,
    distortionOn,
    setDistortionOn,
  };
};
