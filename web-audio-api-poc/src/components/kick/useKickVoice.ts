import { useState } from "react";
import * as Tone from "tone";
import { distortionMakeupGain } from "../../lib/distortionMakeupGain";

const PITCH_DROP_START = 180; // starting "click" pitch the VCO glides down from, in Hz

/**
 * The kick's live knob state and its `trigger` function — the TR-808
 * recipe behind {@link KickPad} (sine VCO + pitch glide + `Tone.Distortion`
 * fatness stage). Kept separate from the pad's presentation so the step
 * sequencer can hold this same instance and schedule its `trigger`
 * directly (see `sequencer/useStepSequencer.ts`).
 *
 * `trigger` accepts an optional `scheduledTime`: called with none (a
 * manual pad press), it unlocks the audio context via `Tone.start()` and
 * fires immediately at `Tone.now()`. Called with a time (from the
 * sequencer's `Tone.Transport.scheduleRepeat` callback), it skips the
 * `Tone.start()` gate — the Transport can only be running after that gate
 * already passed once via the transport's own Start button — and
 * schedules everything at the precise time the look-ahead scheduler asked
 * for, rather than at "now."
 *
 * @returns The kick's `tone`/`decay`/`volume`/`pressed` state, their
 * setters, and `trigger`.
 */
export const useKickVoice = () => {
  const [tone, setTone] = useState(50); // resting fundamental frequency the pitch glide settles on, in Hz
  const [decay, setDecay] = useState(0.35); // amp envelope decay length, in seconds
  const [volume, setVolume] = useState(75); // 0-100%, overall output level
  const [pressed, setPressed] = useState(false); // drives the pad's lit state — real mousedown/up, not hover

  const trigger = async (scheduledTime?: number) => {
    if (scheduledTime === undefined) {
      // Required by browser autoplay policy — must run in direct response
      // to a user gesture, same as every other manual trigger in this
      // project. Skipped for scheduled calls: the Transport is only ever
      // running after Start already passed this gate once.
      await Tone.start();
    }

    const now = scheduledTime ?? Tone.now();
    const pitchDropTime = 0.05; // ~50ms glide — fast enough to read as a "click," not a siren
    const duration = decay; // "Decay" knob: short, punchy decay — fat but not a long boomy tail
    const level = volume / 100; // Volume slider as a 0-1 multiplier applied to the VCA peak

    // VCO with a pitch envelope: starts bright, glides down to the sub fundamental
    const osc = new Tone.Oscillator(PITCH_DROP_START, "sine");
    osc.frequency.exponentialRampToValueAtTime(tone, now + pitchDropTime); // "Tone" knob: the pitch it settles on

    // Saturation stage (Drive knob): Tone.Distortion is a prebuilt
    // WaveShaper wrapper — the "0.4" is the same kind of drive amount as
    // the raw version's hand-computed tanh curve.
    const distortionAmount = 0.1;
    const saturation = new Tone.Distortion(distortionAmount);
    saturation.oversample = "4x";

    // Output/makeup gain (the "Output" knob you'd find after a drive stage
    // on real distortion gear): restores the peak level the Distortion
    // curve crushed, so the drive adds harmonics without also quietly
    // thinning out the kick.
    const makeupGain = new Tone.Gain(distortionMakeupGain(distortionAmount));

    // VCA: instant attack, no ramp-up, exponential decay curve
    const ampGain = new Tone.Gain(1).toDestination();
    ampGain.gain.setValueAtTime(level, now); // "Volume" slider sets the peak level
    ampGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(saturation); // VCO -> Drive
    saturation.connect(makeupGain); // Drive -> Output trim
    makeupGain.connect(ampGain); // Output trim -> VCA
    osc.start(now);
    osc.stop(now + duration);

    // Tone.js nodes need an explicit .dispose() once their sound has
    // finished, unlike a disconnected raw OscillatorNode which is
    // garbage-collected on its own.
    setTimeout(
      () => {
        osc.dispose();
        saturation.dispose();
        makeupGain.dispose();
        ampGain.dispose();
      },
      (duration + 0.1) * 1000,
    );
  };

  return { tone, setTone, decay, setDecay, volume, setVolume, pressed, setPressed, trigger };
};
