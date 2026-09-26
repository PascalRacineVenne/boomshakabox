import * as Tone from "tone";
import { effectsBusInput } from "./effectsBus";
import { delayReverbInsertOutput } from "./delayReverbInsert";

export const FILTER_MODE_OPTIONS = {
  LOWPASS: { value: "lowpass", label: "LP" },
  BANDPASS: { value: "bandpass", label: "BP" },
  HIGHPASS: { value: "highpass", label: "HP" },
} as const;

const FILTER_ENV_DECAY = 0.15;
const ENV_DEPTH_HZ = 4000;

export type FilterMode =
  (typeof FILTER_MODE_OPTIONS)[keyof typeof FILTER_MODE_OPTIONS]["value"];

const masterFilter = new Tone.Filter(12000, FILTER_MODE_OPTIONS.LOWPASS.value);
masterFilter.connect(effectsBusInput);

const masterGain = new Tone.Gain(0.75);
// See DOCS/buses/master-bus.md for the full chain this sits in.
delayReverbInsertOutput.connect(masterGain);

const masterLimiter = new Tone.Limiter(-1).toDestination();
masterGain.connect(masterLimiter);

export const masterBusInput = masterFilter;

export { masterFilter, masterGain, masterLimiter };

const filterEnvelope = new Tone.Envelope({
  attack: 0.001,
  decay: FILTER_ENV_DECAY,
  sustain: 0,
  release: 0.01,
});

const envDepthGain = new Tone.Gain(0);
filterEnvelope.connect(envDepthGain);
envDepthGain.connect(masterFilter.frequency);

export const setMasterFilterEnvAmount = (amount: number) => {
  envDepthGain.gain.value = amount * ENV_DEPTH_HZ;
};

let lastEnvelopeTriggerTime = -1;

export const triggerMasterFilterEnvelope = (time: number) => {
  if (time === lastEnvelopeTriggerTime) return;
  lastEnvelopeTriggerTime = time;
  filterEnvelope.triggerAttack(time);
};
