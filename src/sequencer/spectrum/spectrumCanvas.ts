import { css } from "@linaria/core";
import {
  SCOPE_CANVAS_WIDTH,
  SCOPE_CANVAS_HEIGHT,
} from "../oscilloscope/scopeCanvas";

// Sized by StepSequencer's CSS Grid row (.scopeRow) via the wrapper, not
// the canvas — see this folder's README for why.
export const SPECTRUM_CANVAS_WIDTH = SCOPE_CANVAS_WIDTH;
// Only used for the very first paint before ResizeObserver reports the
// wrapper's real (stretched/grown) size.
export const SPECTRUM_CANVAS_INITIAL_HEIGHT = SCOPE_CANVAS_HEIGHT;

// See this folder's README for why the canvas is absolutely positioned
// inside this plain wrapper rather than sized directly.
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

// AnalyserNode's own default dB range — see README.
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
