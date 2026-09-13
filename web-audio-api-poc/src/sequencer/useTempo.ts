import { useCallback, useState } from "react";
import * as Tone from "tone";
import { clamp } from "../lib/clamp";

const DEFAULT_BPM = 120;
const MIN_BPM = 20;
const MAX_BPM = 300;

/**
 * Wraps `Tone.getTransport().bpm` read/write. `Tone.getTransport().bpm` is the
 * single source of truth for playback tempo (step 2 of the sequencer
 * plan) — this hook keeps a React-state mirror purely so a UI control can
 * render against it, and writes through to the real value on every
 * change.
 *
 * `bpm` is an AudioParam-backed `Tone.Signal`, so per this project's
 * architecture rules on live parameter changes (see ARCHITECTURE-SPEC.MD's
 * "Avoiding zipper noise / clicks"), every write uses `.rampTo` with a
 * short ramp rather than a raw `.value =` assignment — otherwise dragging
 * a knob while the transport is running would produce audible tempo
 * "steps."
 *
 * @param initialBpm - Seed value used only if the Transport hasn't been
 * touched yet.
 * @returns `bpm`, `setBpm`, and the allowed `min`/`max` range.
 */
export const useTempo = (initialBpm: number = DEFAULT_BPM) => {
  // Read the Transport's own current value rather than writing to it during
  // render — Tone.getTransport().bpm already defaults to 120bpm, matching
  // DEFAULT_BPM, so this is a pure read, not a render-time side effect.
  const [bpm, setBpmState] = useState(() => Tone.getTransport().bpm.value || initialBpm);

  const setBpm = useCallback((value: number, rampTime = 0.02) => {
    const clamped = clamp(value, MIN_BPM, MAX_BPM);
    setBpmState(clamped);
    Tone.getTransport().bpm.rampTo(clamped, rampTime);
  }, []);

  return { bpm, setBpm, min: MIN_BPM, max: MAX_BPM };
}
