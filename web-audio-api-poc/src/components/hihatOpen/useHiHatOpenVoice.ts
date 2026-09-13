import { useState } from "react";
import * as Tone from "tone";
import { HI_HAT_OSCILLATOR_FREQUENCIES } from "../../lib/hiHatOscillatorFrequencies";
import { startAudioContext } from "../../lib/startAudioContext";

/**
 * The open hi-hat's live knob state and its `trigger` function — the same
 * TR-808 hex-oscillator bank as {@link useHiHatVoice} (six square VCOs
 * through a highpass VCF), but with a longer, knob-controlled VCA decay
 * instead of the closed hat's short fixed one — the "ring" that makes it
 * read as open. Kept separate from the pad's presentation so the step
 * sequencer can hold this same instance and schedule its `trigger`
 * directly (see `sequencer/useStepSequencer.ts`).
 *
 * `trigger` accepts an optional `scheduledTime` — see `useKickVoice` for
 * why: manual presses fire at `Tone.now()` after unlocking audio via
 * {@link startAudioContext}, scheduled calls fire at the precise Transport
 * time instead.
 *
 * One-shot/percussive per ARCHITECTURE-SPEC.MD's classification: knob
 * changes only need to reach the next triggered voice, so no direct node
 * write is wired up for live playback.
 *
 * @returns The open hi-hat's `tone`/`decay`/`volume`/`pressed` state,
 * their setters, and `trigger`.
 */
export const useHiHatOpenVoice = () => {
  const [tone, setTone] = useState(7000); // highpass VCF cutoff, in Hz — brightness/metallic content
  const [decay, setDecay] = useState(0.4); // amp envelope decay length, in seconds — the open hat's "ring"
  const [volume, setVolume] = useState(75); // 0-100%, overall output level
  const [pressed, setPressed] = useState(false); // drives the pad's lit state — real mousedown/up, not hover

  const trigger = async (scheduledTime?: number) => {
    // Skipped for scheduled calls: the Transport is only ever running
    // after Start already passed this gate once.
    if (scheduledTime === undefined) {
      await startAudioContext();
    }

    const now = scheduledTime ?? Tone.now();
    const duration = decay; // "Decay" knob: how long the open hat rings before dying out
    const level = volume / 100; // Volume slider as a 0-1 multiplier applied to the VCA peak

    // VCF: highpass filters out the fundamentals of the six VCOs below,
    // leaving the upper harmonics that read as "metallic." "Tone" knob
    // sweeps this cutoff for a brighter/darker hat.
    const filter = new Tone.Filter(tone, "highpass");

    // VCA: instant attack, no ramp-up, exponential decay curve
    const ampGain = new Tone.Gain(1).toDestination();
    ampGain.gain.setValueAtTime(level, now);
    ampGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    filter.connect(ampGain);

    const oscillators = HI_HAT_OSCILLATOR_FREQUENCIES.map((freq) => {
      const osc = new Tone.Oscillator(freq, "square").connect(filter);
      osc.start(now);
      osc.stop(now + duration);
      return osc;
    });

    setTimeout(
      () => {
        oscillators.forEach((osc) => osc.dispose());
        filter.dispose();
        ampGain.dispose();
      },
      (duration + 0.1) * 1000,
    );
  };

  return { tone, setTone, decay, setDecay, volume, setVolume, pressed, setPressed, trigger };
};
