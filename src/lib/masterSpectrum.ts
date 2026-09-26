import * as Tone from "tone";
import { masterLimiter } from "./masterBus";

// 2048 -> 2048 output bins (Tone.Analyser sets fftSize = size * 2
// internally) for useMasterSpectrum's log-frequency downsampling to draw
// from. See sequencer/spectrum/README.md for the full picture.
export const MASTER_SPECTRUM_SIZE = 2048;

// Tapped off masterLimiter, not masterBusInput, so this reflects what
// actually reaches the speakers. Pure fan-out — doesn't alter the signal.
export const masterSpectrumAnalyser = new Tone.Analyser(
  "fft",
  MASTER_SPECTRUM_SIZE,
);
masterLimiter.connect(masterSpectrumAnalyser);
