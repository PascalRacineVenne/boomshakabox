import * as Tone from "tone";

const effectsDriveTrim = new Tone.Gain(1);
const effectsDrive = new Tone.Distortion(0);
effectsDriveTrim.connect(effectsDrive);
const effectsFilter = new Tone.Filter({
  type: "lowpass",
  frequency: 12000,
  Q: 0.5,
  rolloff: -24,
});
effectsDrive.connect(effectsFilter);

const effectsCompressor = new Tone.Compressor({
  threshold: -12,
  ratio: 4,
  attack: 0.003,
  release: 0.1,
});
const effectsLimiter = new Tone.Limiter(-1);
effectsFilter.connect(effectsCompressor);
effectsCompressor.connect(effectsLimiter);

export const effectsBusInput = effectsDriveTrim;

export const effectsBusOutput = effectsLimiter;

export {
  effectsDriveTrim,
  effectsDrive,
  effectsFilter,
  effectsCompressor,
  effectsLimiter,
};
