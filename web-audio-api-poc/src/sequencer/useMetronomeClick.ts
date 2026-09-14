import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { clamp } from "../lib/clamp";

const CLICK_TONE = 1000; // Hz — a bright, classic metronome "tick" pitch; fixed, not user-adjustable
const DEFAULT_VOLUME = 50; // 0-100%, matches the Volume slider convention used elsewhere in this project
const DEFAULT_MUTED = true; // the click is silent by default — an opt-in reference tone, not a surprise on first Start

/**
 * Drives an audible metronome click on every beat, on its own `Tone.Loop`
 * at the same `"4n"` quarter-note grid as the visual pulse in
 * `useBeatPulse.ts`. Two independent loops both quantized to the
 * Transport's `"4n"` grid fire in lockstep with no drift risk between
 * them, so this stays separate rather than threading audio-triggering
 * into the visual-only hook.
 *
 * The synth + gain chain is created once and kept alive for the hook's
 * lifetime (this project's node-lifecycle rule, ARCHITECTURE-SPEC.MD) —
 * every beat only calls `.triggerAttackRelease()` on the pre-existing
 * synth, never creates a new node. The click's pitch is fixed
 * (`CLICK_TONE`) rather than a knob — only level (`volume`) and on/off
 * (`muted`) are user-adjustable.
 *
 * @returns The click's `volume`/`muted` state and their setters.
 */
export const useMetronomeClick = () => {
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [muted, setMutedState] = useState(DEFAULT_MUTED);

  // Read by setVolume/setMuted so either setter can recompute the
  // effective gain (volume x mute) without needing the other state's own
  // setter to also fire — the same "live params ref" pattern
  // ARCHITECTURE-SPEC.MD uses for values read outside React's render cycle.
  const volumeRef = useRef(volume);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const gainRef = useRef<Tone.Gain | null>(null);

  useEffect(() => {
    const synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
    });
    const gain = new Tone.Gain(DEFAULT_MUTED ? 0 : DEFAULT_VOLUME / 100).toDestination();
    synth.connect(gain);
    gainRef.current = gain;

    const loop = new Tone.Loop((time) => {
      synth.triggerAttackRelease(CLICK_TONE, "32n", time);
    }, "4n").start(0);

    return () => {
      loop.dispose();
      synth.dispose();
      gain.dispose();
      gainRef.current = null;
    };
  }, []); // created once for the hook's lifetime — never recreated on volume/mute changes

  const setVolume = useCallback((value: number) => {
    const clamped = clamp(value, 0, 100);
    setVolumeState(clamped);
    // volume is a live AudioParam (Tone.Gain.gain) — ramp rather than jump,
    // same "no zipper noise" rule as useTempo's bpm.rampTo, in case it's
    // dragged while the click is actively playing.
    gainRef.current?.gain.rampTo(mutedRef.current ? 0 : clamped / 100, 0.02);
  }, []);

  const setMuted = useCallback((value: boolean) => {
    setMutedState(value);
    gainRef.current?.gain.rampTo(value ? 0 : volumeRef.current / 100, 0.02);
  }, []);

  return {
    volume,
    setVolume,
    muted,
    setMuted,
  };
}
