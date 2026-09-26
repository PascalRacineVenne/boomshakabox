import { css } from "@linaria/core";
import { SCOPE_CANVAS_WIDTH, SCOPE_CANVAS_HEIGHT } from "../oscilloscope/scopeCanvas";

// Width: StepSequencer's row lays this out on a CSS Grid, giving this
// component's column `minmax(SPECTRUM_CANVAS_WIDTH, 1fr)` — never
// smaller than a single scope canvas's width, but absorbing any
// leftover space in the row (see .scopeRow in StepSequencer.tsx). Height
// is matched to the row's stretched height (same as the waveform box)
// via the wrapper, not the canvas itself. In both cases the wrapper just
// needs to stretch to fill whatever cell the grid gives it — grid items
// stretch to fill their cell by default in both axes, so no explicit
// width/height/flex is needed here at all.
export const SPECTRUM_CANVAS_WIDTH = SCOPE_CANVAS_WIDTH;
// Only used for the very first paint before ResizeObserver reports the
// wrapper's real (stretched/grown) size.
export const SPECTRUM_CANVAS_INITIAL_HEIGHT = SCOPE_CANVAS_HEIGHT;

// Three earlier attempts tried to size the canvas directly (via
// ResizeObserver on the canvas, CSS stretch on the canvas, or flexbox
// flex-grow/shrink tuning) and each caused a different failure: a
// canvas's width/height attributes double as both its intrinsic size —
// which a flex row's own auto-size calculation can depend on — and its
// DPI backing-store resolution, so mutating them each resize fed back
// into the very layout being measured; flexbox's flex-shrink/min-width
// interactions then proved too easy to get subtly wrong by hand. The fix
// is structural on two fronts: the canvas is `position: absolute` inside
// this plain wrapper div (spectrumCanvasClass below), fully removed from
// normal flow so it can never influence the wrapper's size; and the row
// itself uses CSS Grid (not flexbox) so each column's sizing is explicit
// and deterministic rather than negotiated.
export const spectrumWrapperClass = css`
  position: relative;
  overflow: hidden;
  border: 1px solid var(--accent-border);
  border-radius: 8px;
  background: black;
`;

export const spectrumCanvasClass = css`
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
`;

// The native Web Audio AnalyserNode's own default dB range
// (minDecibels/maxDecibels) — Tone.Analyser doesn't override these, so
// this is the real range getFloatFrequencyData() can return, not a
// guess.
export const DB_MIN = -100;
export const DB_MAX = -30;

// The conventional tick set audio tools use for a 20Hz-20kHz log scale —
// hardcoded rather than auto-generated "nice" log ticks. All 19 draw as
// thin gridlines; only the decade markers (FREQ_TICK_LABELS) get text,
// since this canvas is too narrow to label all 19 without them
// overlapping.
export const FREQ_TICKS = [
  20, 30, 40, 60, 80, 100, 200, 300, 400, 600, 800, 1000, 2000, 3000, 4000,
  6000, 8000, 10000, 20000,
];
// 10K dropped from this set: it sits too close to 20K in log-space at
// this canvas width for both labels to fit without overlapping.
export const FREQ_TICK_LABELS = [20, 100, 1000, 20000];

// Plot-area margins carved out of the canvas for axis labels. Height is
// dynamic, so these resolve against whatever the wrapper's actual
// current logical size is, not a fixed constant.
const LEFT_MARGIN = 24;
const RIGHT_MARGIN = 4;
const TOP_MARGIN = 4;
const BOTTOM_MARGIN = 11;

export const getPlotBounds = (logicalWidth: number, logicalHeight: number) => ({
  left: LEFT_MARGIN,
  right: logicalWidth - RIGHT_MARGIN,
  top: TOP_MARGIN,
  bottom: logicalHeight - BOTTOM_MARGIN,
});
