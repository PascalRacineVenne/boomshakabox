import { useState } from "react";
import * as Tone from "tone";
import {
  masterBusInput,
  triggerMasterFilterEnvelope,
} from "../../lib/masterBus";
import { startAudioContext } from "../../lib/startAudioContext";

// Ratio between the two tone-voice VCOs in the original fixed-frequency
// recipe (330/180) — preserved when the "Tone" knob shifts the base
// frequency, so the interval between them stays the same as you tune it.
const TONE_VOICE_RATIO = 330 / 180;

export const SNARE_TONE_MIN = 100;
export const SNARE_TONE_MAX = 300;
export const SNARE_SNAPPY_MIN = 0;
export const SNARE_SNAPPY_MAX = 1;

/**
 * The snare's live knob state and its `trigger` function — the TR-808
 * recipe behind {@link SnarePad} (two triangle VCOs for the tone voice,
 * highpass-filtered noise for the snap voice). Kept separate from the
 * pad's presentation so the step sequencer can hold this same instance
 * and schedule its `trigger` directly (see
 * `sequencer/useStepSequencer.ts`).
 *
 * `trigger` accepts an optional `scheduledTime` — see `useKickVoice` for
 * why: manual presses fire at `Tone.now()` after unlocking audio via
 * {@link startAudioContext}, scheduled calls fire at the precise
 * Transport time instead.
 *
 * @returns The snare's `tone`/`snappy`/`volume`/`pan`/`pressed` state,
 * their setters, and `trigger`.
 */
export const useSnareVoice = () => {
  const [tone, setTone] = useState(180); // base frequency of the tone voice's VCOs, in Hz
  const [snappy, setSnappy] = useState(1); // 0-1 mix level of the noise/snap voice
  const [volume, setVolume] = useState(75); // 0-100%, overall output level for both voices
  const [pan, setPan] = useState(0); // -100 (hard left) to 100 (hard right)
  const [pressed, setPressed] = useState(false); // drives the pad's lit state — real mousedown/up, not hover

  const trigger = async (scheduledTime?: number) => {
    // Skipped for scheduled calls: the Transport is only ever running
    // after Start already passed this gate once.
    if (scheduledTime === undefined) {
      await startAudioContext();
    }

    const now = scheduledTime ?? Tone.now();
    const duration = 0.2; // ~200ms, matching the 808's fixed snare decay
    const level = volume / 100; // Volume slider as a 0-1 multiplier applied to both voices' peaks

    // Sweeps the master filter on every hit — see `triggerMasterFilterEnvelope`.
    triggerMasterFilterEnvelope(now);

    // Stereo placement (Pan knob): both voices below share this one panner
    // so the tone and snap stay correlated at the same position in the
    // stereo field, rather than each drifting independently.
    const panner = new Tone.Panner(pan / 100).connect(masterBusInput);

    // --- Tone voice: two VCOs summed into one VCA ---
    const toneGain = new Tone.Gain(1).connect(panner);
    toneGain.gain.setValueAtTime(0.7 * level, now);
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const oscillators = [tone, tone * TONE_VOICE_RATIO].map((freq) => {
      const osc = new Tone.Oscillator(freq, "triangle").connect(toneGain);
      osc.start(now);
      osc.stop(now + duration);
      return osc;
    });

    // --- Snap voice: noise source -> filter (VCF) -> its own VCA/EG ---
    const noiseFilter = new Tone.Filter(1000, "highpass");
    const noiseGain = new Tone.Gain(1).connect(panner);
    noiseGain.gain.setValueAtTime(snappy * level, now); // "Snappy" knob mix, scaled by the Volume slider
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const noise = new Tone.Noise("white").connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noise.start(now);
    noise.stop(now + duration);

    setTimeout(
      () => {
        oscillators.forEach((osc) => osc.dispose());
        toneGain.dispose();
        noise.dispose();
        noiseFilter.dispose();
        noiseGain.dispose();
        panner.dispose();
      },
      (duration + 0.1) * 1000,
    );
  };

  return {
    tone,
    setTone,
    snappy,
    setSnappy,
    volume,
    setVolume,
    pan,
    setPan,
    pressed,
    setPressed,
    trigger,
  };
};
