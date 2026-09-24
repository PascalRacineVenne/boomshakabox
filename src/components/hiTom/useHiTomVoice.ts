import { useState } from "react";
import * as Tone from "tone";
import { startAudioContext } from "../../lib/startAudioContext";
import {
  masterBusInput,
  triggerMasterFilterEnvelope,
} from "../../lib/masterBus";
import { distortionMakeupGain } from "../../lib/distortionMakeupGain";

export const TONE_MIN = 165;
export const TONE_MAX = 220;
export const DECAY_MIN = 0.08;
export const DECAY_MAX = 0.6;

const PITCH_DROP_RATIO = 1.15;
const FILTER_Q = 3;

export const useHiTomVoice = () => {
  const [tone, setTone] = useState(190);
  const [decay, setDecay] = useState(0.15);
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
    const pitchDropTime = 0.025;
    const duration = decay;
    const level = muted ? 0 : (volume / 100) * (velocity / 100);

    triggerMasterFilterEnvelope(now);

    const osc = new Tone.Oscillator(tone * PITCH_DROP_RATIO, "sine");
    osc.frequency.exponentialRampToValueAtTime(tone, now + pitchDropTime);

    const filter = new Tone.Filter(tone, "bandpass");
    filter.Q.value = FILTER_Q;

    const distortionAmount = 0.04;
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
