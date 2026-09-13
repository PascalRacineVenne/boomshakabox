import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { clamp } from "../lib/clamp";

const DEFAULT_TONE = 1000; // Hz — a bright, classic metronome "tick" pitch
const MIN_TONE = 200;
const MAX_TONE = 2000;
const DEFAULT_VOLUME = 75; // 0-100%, matches the Volume slider convention used elsewhere in this project

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
 * synth, never creates a new node.
 *
 * @returns The click's `tone`/`volume` state and their setters, plus the
 * allowed tone range.
 */
export const useMetronomeClick = () => {
  const [tone, setToneState] = useState(DEFAULT_TONE);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);

  // The Loop callback below is created once in a mount-only effect, so it
  // closes over whatever "tone" was at mount time unless it reads through a
  // ref instead — the same "live params ref" pattern used for scheduler
  // callbacks in ARCHITECTURE-SPEC.MD. Kept in sync via its own effect
  // rather than written during render (react-hooks/refs disallows that).
  const toneRef = useRef(tone);
  useEffect(() => {
    toneRef.current = tone;
  }, [tone]);

  const gainRef = useRef<Tone.Gain | null>(null);

  useEffect(() => {
    const synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
    });
    const gain = new Tone.Gain(DEFAULT_VOLUME / 100).toDestination();
    synth.connect(gain);
    gainRef.current = gain;

    const loop = new Tone.Loop((time) => {
      synth.triggerAttackRelease(toneRef.current, "32n", time);
    }, "4n").start(0);

    return () => {
      loop.dispose();
      synth.dispose();
      gain.dispose();
      gainRef.current = null;
    };
  }, []); // created once for the hook's lifetime — never recreated on tone/volume changes

  const setTone = useCallback((value: number) => {
    setToneState(clamp(value, MIN_TONE, MAX_TONE));
  }, []);

  const setVolume = useCallback((value: number) => {
    const clamped = clamp(value, 0, 100);
    setVolumeState(clamped);
    // volume is a live AudioParam (Tone.Gain.gain) — ramp rather than jump,
    // same "no zipper noise" rule as useTempo's bpm.rampTo, in case it's
    // dragged while the click is actively playing.
    gainRef.current?.gain.rampTo(clamped / 100, 0.02);
  }, []);

  return {
    tone,
    setTone,
    minTone: MIN_TONE,
    maxTone: MAX_TONE,
    volume,
    setVolume,
  };
}
