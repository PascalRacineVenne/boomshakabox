import { useState } from "react";
import * as Tone from "tone";
import { HI_HAT_OSCILLATOR_FREQUENCIES } from "../../lib/hiHatOscillatorFrequencies";
import {
  masterBusInput,
  triggerMasterFilterEnvelope,
} from "../../lib/masterBus";
import { startAudioContext } from "../../lib/startAudioContext";

const DECAY = 0.05;
export const HH_TONE_MIN = 3000;
export const HH_TONE_MAX = 10000;

export const useHiHatVoice = () => {
  const [tone, setTone] = useState(7000);
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
    const level = muted ? 0 : (volume / 100) * (velocity / 100); // Volume x the step's velocity (0-100%), forced silent while muted

    triggerMasterFilterEnvelope(now);

    const filter = new Tone.Filter(tone, "highpass");

    const ampGain = new Tone.Gain(1);
    ampGain.gain.setValueAtTime(level, now);
    ampGain.gain.exponentialRampToValueAtTime(0.001, now + DECAY);
    filter.connect(ampGain);

    const panner = new Tone.Panner(pan / 100).connect(masterBusInput);
    ampGain.connect(panner);

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
        panner.dispose();
      },
      (DECAY + 0.1) * 1000,
    );
  };

  return {
    tone,
    setTone,
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
