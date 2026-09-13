import { useState } from "react";
import * as Tone from "tone";
import { HI_HAT_OSCILLATOR_FREQUENCIES } from "../../lib/hiHatOscillatorFrequencies";
import { startAudioContext } from "../../lib/startAudioContext";

// Closed hat: short, tight amp envelope with no sustain — this is what
// makes it read as "closed" rather than the open hat's longer ring.
const DECAY = 0.05;

/**
 * The closed hi-hat's live knob state and its `trigger` function — the
 * TR-808 recipe behind {@link HiHatPad} (six square VCOs summed, then a
 * highpass VCF for the metallic sheen, into a short fixed-decay VCA). Kept
 * separate from the pad's presentation so the step sequencer can hold this
 * same instance and schedule its `trigger` directly (see
 * `sequencer/useStepSequencer.ts`).
 *
 * `trigger` accepts an optional `scheduledTime` — see `useKickVoice` for
 * why: manual presses fire at `Tone.now()` after unlocking audio via
 * {@link startAudioContext}, scheduled calls fire at the precise Transport
 * time instead.
 *
 * One-shot/percussive per ARCHITECTURE-SPEC.MD's classification: the
 * "Tone" knob only needs to reach the next triggered voice, so no direct
 * node write is wired up for live playback.
 *
 * @returns The hi-hat's `tone`/`volume`/`pressed` state, their setters, and
 * `trigger`.
 */
export const useHiHatVoice = () => {
  const [tone, setTone] = useState(7000); // highpass VCF cutoff, in Hz — brightness/metallic content
  const [volume, setVolume] = useState(75); // 0-100%, overall output level
  const [pressed, setPressed] = useState(false); // drives the pad's lit state — real mousedown/up, not hover

  const trigger = async (scheduledTime?: number) => {
    // Skipped for scheduled calls: the Transport is only ever running
    // after Start already passed this gate once.
    if (scheduledTime === undefined) {
      await startAudioContext();
    }

    const now = scheduledTime ?? Tone.now();
    const level = volume / 100; // Volume slider as a 0-1 multiplier applied to the VCA peak

    // VCF: highpass filters out the fundamentals of the six VCOs below,
    // leaving the upper harmonics that read as "metallic." "Tone" knob
    // sweeps this cutoff for a brighter/darker hat.
    const filter = new Tone.Filter(tone, "highpass");

    // VCA: instant attack, no ramp-up, exponential decay curve
    const ampGain = new Tone.Gain(1).toDestination();
    ampGain.gain.setValueAtTime(level, now);
    ampGain.gain.exponentialRampToValueAtTime(0.001, now + DECAY);
    filter.connect(ampGain);

    const oscillators = HI_HAT_OSCILLATOR_FREQUENCIES.map((freq) => {
      const osc = new Tone.Oscillator(freq, "square").connect(filter);
      osc.start(now);
      osc.stop(now + DECAY);
      return osc;
    });

    setTimeout(
      () => {
        oscillators.forEach((osc) => osc.dispose());
        filter.dispose();
        ampGain.dispose();
      },
      (DECAY + 0.1) * 1000,
    );
  };

  return { tone, setTone, volume, setVolume, pressed, setPressed, trigger };
};
