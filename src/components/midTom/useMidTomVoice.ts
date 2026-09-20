import { useState } from "react";
import * as Tone from "tone";
import { startAudioContext } from "../../lib/startAudioContext";
import {
  masterBusInput,
  triggerMasterFilterEnvelope,
} from "../../lib/masterBus";
import { distortionMakeupGain } from "../../lib/distortionMakeupGain";

export const TONE_MIN = 120; // low end of the mid tom's register (B2), in Hz
export const TONE_MAX = 160; // high end of the mid tom's register (D#3), in Hz
export const DECAY_MIN = 0.08;
export const DECAY_MAX = 0.6;

const PITCH_DROP_RATIO = 1.15; // glide starts 15% above the settled tone — a subtle "tonk," not the kick's dramatic sweep
const FILTER_Q = 3; // mild resonance on the tuned bandpass, per the 808 tom recipe

export const useMidTomVoice = () => {
  const [tone, setTone] = useState(140); // mid-register mid tom pitch, in Hz — see TONE_MIN/TONE_MAX
  const [decay, setDecay] = useState(0.13); // 808 mid toms ring for ~130ms — between the hi and low tom
  const [volume, setVolume] = useState(75);
  const [pan, setPan] = useState(0);
  // Mute/solo — see useSnareVoice.ts for the full rationale: `muted` gates
  // `trigger`'s level without touching `volume` itself, `soloed` is
  // visual-only for now (cross-voice silencing isn't wired up).
  const [muted, setMuted] = useState(false);
  const [soloed, setSolo] = useState(false);
  const [pressed, setPressed] = useState(false);

  const trigger = async (scheduledTime?: number) => {
    if (scheduledTime === undefined) {
      await startAudioContext();
    }

    const now = scheduledTime ?? Tone.now();
    const pitchDropTime = 0.025; // faster, subtler glide than the kick's 50ms
    const duration = decay;
    const level = muted ? 0 : volume / 100; // forced silent while muted

    triggerMasterFilterEnvelope(now);

    const osc = new Tone.Oscillator(tone * PITCH_DROP_RATIO, "sine");
    osc.frequency.exponentialRampToValueAtTime(tone, now + pitchDropTime); // "Tone" knob: the pitch it settles on

    // Bandpass filter tuned to the fundamental with mild resonance — this
    // tuned/resonant quality is what reads as a tom instead of a kick.
    const filter = new Tone.Filter(tone, "bandpass");
    filter.Q.value = FILTER_Q;

    const distortionAmount = 0.04; // lighter than the kick's — brightens the attack without fattening the tail
    const saturation = new Tone.Distortion(distortionAmount);
    saturation.oversample = "2x";

    const makeupGain = new Tone.Gain(distortionMakeupGain(distortionAmount));

    const ampGain = new Tone.Gain(1);
    ampGain.gain.setValueAtTime(level, now);
    ampGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const panner = new Tone.Panner(pan / 100).connect(masterBusInput);

    osc.connect(filter);
    filter.connect(saturation);
    saturation.connect(makeupGain);
    makeupGain.connect(ampGain);
    ampGain.connect(panner);
    osc.start(now);
    osc.stop(now + duration);

    setTimeout(
      () => {
        osc.dispose();
        filter.dispose();
        saturation.dispose();
        makeupGain.dispose();
        ampGain.dispose();
        panner.dispose();
      },
      (duration + 0.1) * 1000,
    );
  };

  return {
    tone,
    setTone,
    decay,
    setDecay,
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
