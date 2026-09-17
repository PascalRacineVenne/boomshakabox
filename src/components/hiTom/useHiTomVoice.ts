import { useState } from "react";
import * as Tone from "tone";
import { startAudioContext } from "../../lib/startAudioContext";
import {
  masterBusInput,
  triggerMasterFilterEnvelope,
} from "../../lib/masterBus";
import { distortionMakeupGain } from "../../lib/distortionMakeupGain";

const PITCH_DROP_START = 180; // starting "click" pitch the VCO glides down from, in Hz

export const useHiTomVoice = () => {
  const [tone, setTone] = useState(100);
  const [decay, setDecay] = useState(0.35);
  const [volume, setVolume] = useState(75);
  const [pan, setPan] = useState(0);
  const [pressed, setPressed] = useState(false);

  const trigger = async (scheduledTime?: number) => {
    if (scheduledTime === undefined) {
      await startAudioContext();
    }

    const now = scheduledTime ?? Tone.now();
    const pitchDropTime = 0.05;
    const duration = decay;
    const level = volume / 100;

    triggerMasterFilterEnvelope(now);

    const osc = new Tone.Oscillator(PITCH_DROP_START, "sine1");
    osc.frequency.exponentialRampToValueAtTime(tone, now + pitchDropTime);

    const distortionAmount = 0.1;
    const saturation = new Tone.Distortion(distortionAmount);
    saturation.oversample = "2x";

    const makeupGain = new Tone.Gain(distortionMakeupGain(distortionAmount));

    const ampGain = new Tone.Gain(1);
    ampGain.gain.setValueAtTime(level, now);
    ampGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const panner = new Tone.Panner(pan / 100).connect(masterBusInput);

    osc.connect(saturation);
    saturation.connect(makeupGain);
    makeupGain.connect(ampGain);
    ampGain.connect(panner);
    osc.start(now);
    osc.stop(now + duration);

    setTimeout(
      () => {
        osc.dispose();
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
    pressed,
    setPressed,
    trigger,
  };
};
