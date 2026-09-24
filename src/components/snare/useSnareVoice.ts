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

export const useSnareVoice = () => {
  const [tone, setTone] = useState(180);
  const [snappy, setSnappy] = useState(1);
  const [volume, setVolume] = useState(75);
  const [pan, setPan] = useState(0);
  const [muted, setMuted] = useState(false);
  const [soloed, setSolo] = useState(false);
  const [pressed, setPressed] = useState(false);

  const trigger = async (scheduledTime?: number, velocity = 100) => {
    if (scheduledTime === undefined) {
      await startAudioContext();
    }

    const now = scheduledTime ?? Tone.now();
    const duration = 0.2;
    const level = muted ? 0 : (volume / 100) * (velocity / 100);

    triggerMasterFilterEnvelope(now);

    const panner = new Tone.Panner(pan / 100).connect(masterBusInput);

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
    noiseGain.gain.setValueAtTime(snappy * level, now);
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
    muted,
    setMuted,
    soloed,
    setSolo,
    pressed,
    setPressed,
    trigger,
  };
};
