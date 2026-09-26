import { useCallback, useRef } from "react";
import * as Tone from "tone";
import {
  masterSpectrumAnalyser,
  MASTER_SPECTRUM_SIZE,
} from "../../lib/masterSpectrum";

// Modest column count so the curve reads as a clean simplified shape,
// not a dense noisy one (roughly 60-100 columns, per the reference).
export const SPECTRUM_COLUMN_COUNT = 72;
export const SPECTRUM_MIN_FREQ = 20;
export const SPECTRUM_MAX_FREQ = 20000;

// Matches the native Web Audio AnalyserNode's own default minDecibels —
// Tone.Analyser doesn't override it, so this is the real floor of what
// getFloatFrequencyData() can return.
const SPECTRUM_FLOOR_DB = -100;

// How fast a held peak decays back down, in dB per animation frame.
// Tune this by eye once running — bigger = snappier, smaller = slower
// "settling" falloff.
const PEAK_DECAY_DB_PER_FRAME = 0.5;

export const columnFrequency = (column: number) =>
  SPECTRUM_MIN_FREQ *
  (SPECTRUM_MAX_FREQ / SPECTRUM_MIN_FREQ) **
    (column / (SPECTRUM_COLUMN_COUNT - 1));

interface BinRange {
  start: number;
  end: number;
}

// Precomputed once per (fftSize, sampleRate): each column's window of
// linear FFT bins to average, spanning the log-frequency gap between its
// neighbors — narrow at the low end (where columns are close together in
// frequency), wide at the high end (where many linear bins fall within
// one log-spaced column).
const buildColumnBinRanges = (
  fftSize: number,
  sampleRate: number,
): BinRange[] => {
  const binHz = sampleRate / fftSize;
  const edgeBin = (column: number) => {
    const lowFreq =
      column <= 0
        ? SPECTRUM_MIN_FREQ
        : Math.sqrt(columnFrequency(column - 1) * columnFrequency(column));
    return Math.max(0, Math.round(lowFreq / binHz));
  };
  const maxBin = Math.round(SPECTRUM_MAX_FREQ / binHz);

  const ranges: BinRange[] = [];
  for (let column = 0; column < SPECTRUM_COLUMN_COUNT; column++) {
    const start = edgeBin(column);
    const nextStart =
      column === SPECTRUM_COLUMN_COUNT - 1 ? maxBin : edgeBin(column + 1);
    const end = Math.max(start, nextStart - 1);
    ranges.push({ start, end });
  }
  return ranges;
};

// Reads the shared master analyser, downsamples it to SPECTRUM_COLUMN_COUNT
// log-spaced columns, and applies peak-hold-with-slow-decay per column.
// Returns a stable accessor (not React state) — the caller's own rAF loop
// calls it each frame, mirroring how WaveformDisplay reads waveformRef
// directly inside its draw loop rather than routing 60fps data through
// component state/re-renders.
export const useMasterSpectrum = () => {
  const heldRef = useRef<Float32Array>(
    new Float32Array(SPECTRUM_COLUMN_COUNT).fill(SPECTRUM_FLOOR_DB),
  );
  const rangesRef = useRef<BinRange[] | null>(null);

  const getSpectrum = useCallback((): Float32Array => {
    const fftSize = MASTER_SPECTRUM_SIZE * 2;
    const sampleRate = Tone.getContext().sampleRate;
    if (!rangesRef.current) {
      rangesRef.current = buildColumnBinRanges(fftSize, sampleRate);
    }
    const ranges = rangesRef.current;
    const held = heldRef.current;

    const data = masterSpectrumAnalyser.getValue();
    if (data instanceof Float32Array) {
      for (let column = 0; column < SPECTRUM_COLUMN_COUNT; column++) {
        const { start, end } = ranges[column];
        let sum = 0;
        let count = 0;
        for (let bin = start; bin <= end && bin < data.length; bin++) {
          sum += data[bin];
          count++;
        }
        const value = count > 0 ? sum / count : SPECTRUM_FLOOR_DB;
        held[column] =
          value > held[column]
            ? value
            : Math.max(SPECTRUM_FLOOR_DB, held[column] - PEAK_DECAY_DB_PER_FRAME);
      }
    }

    return held;
  }, []);

  return getSpectrum;
};
