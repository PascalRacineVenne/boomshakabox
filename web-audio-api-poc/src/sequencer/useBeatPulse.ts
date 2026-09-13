import { useEffect, useState } from "react";
import * as Tone from "tone";

const FLASH_DURATION_MS = 100; // safely under half a beat even at the 300bpm ceiling (200ms/beat)

/**
 * Drives a metronome-style beat indicator off the Transport's own
 * quarter-note clock, independent of any step sequencer pattern. The
 * `Tone.Loop` only fires while `Tone.getTransport()` is actually running,
 * so this naturally goes quiet when playback stops — no separate
 * start/stop wiring needed here.
 *
 * UI state is written only from the `Tone.getDraw().schedule` callback, never
 * directly inside the Loop's audio callback (see the sequencer plan's step
 * 3/6: writing state directly in the audio callback makes the UI visually
 * run ahead of the audio it's supposed to reflect).
 *
 * @returns `beat` (0-3, current beat within the bar) and `flash` (briefly
 * true right on each beat).
 */
export const useBeatPulse = () => {
  const [beat, setBeat] = useState(0); // 0-3, current beat within the bar
  const [flash, setFlash] = useState(false); // briefly true right on each beat

  useEffect(() => {
    let beatCount = 0;
    let flashTimeout: ReturnType<typeof setTimeout> | undefined;

    // Created once for the indicator's lifetime, matching this project's
    // node-lifecycle rule (ARCHITECTURE-SPEC.MD) — never recreated on
    // Start/Stop clicks.
    const loop = new Tone.Loop((time) => {
      const currentBeat = beatCount % 4;
      beatCount += 1;

      Tone.getDraw().schedule(() => {
        setBeat(currentBeat);
        setFlash(true);
        clearTimeout(flashTimeout);
        flashTimeout = setTimeout(() => setFlash(false), FLASH_DURATION_MS);
      }, time);
    }, "4n").start(0);

    return () => {
      loop.dispose();
      clearTimeout(flashTimeout);
    };
  }, []);

  return { beat, flash };
}
