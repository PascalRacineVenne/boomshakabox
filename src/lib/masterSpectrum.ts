import * as Tone from "tone";
import { masterLimiter } from "./masterBus";

// FFT size: 2048 — good resolution without excess CPU/binning cost. This
// yields 2048 output bins (Tone.Analyser sets fftSize = size * 2
// internally), plenty for the log-frequency downsampling in
// useMasterSpectrum to draw from.
export const MASTER_SPECTRUM_SIZE = 2048;

// A single shared analyser, connected once to the final node before
// toDestination() — masterLimiter, not masterBusInput — so this reflects
// what actually reaches the speakers (post-effects, post-compression),
// not the pre-effects signal. Tapping here is a pure fan-out; it doesn't
// alter or insert itself into the signal path.
export const masterSpectrumAnalyser = new Tone.Analyser(
  "fft",
  MASTER_SPECTRUM_SIZE,
);
masterLimiter.connect(masterSpectrumAnalyser);
