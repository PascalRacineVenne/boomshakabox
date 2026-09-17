import { css } from "@linaria/core";

export const LABELED_SMALL_KNOB_HEIGHT_UNITS = 40;
// 2x the default 40-unit height of a single knob, to fit the label above
export const VOLUME_MIN = 0;
export const VOLUME_MAX = 100;
export const PANNING_L = -100;
export const PANNING_R = 100;

/** Formats a -100..100 Pan slider value as "L50"/"C"/"R50" instead of a bare signed number. */
export const formatPan = (value: number) => {
  if (value === 0) return "C";
  return value < 0 ? `L${Math.abs(value)}` : `R${value}`;
};

/**
 * Shared layout classNames for a Tone.js voice's slider + knobs + trigger,
 * so every "device" reads as one grouped unit rather than loose controls
 * scattered by the outer flex layout. Reuses the same
 * `--audioui-unit`/`--accent-border` tokens the audio-ui-react components
 * themselves are themed with (see ui-stack.md's styling model) instead of
 * introducing separate values.
 *
 * Kept in its own file, deliberately free of any `@cutoff/audio-ui-react`
 * import: Linaria's build-time evaluator needs to trace the whole import
 * graph of any file containing a styled/css tag, and chokes on that
 * package's ESM-only exports when both live in the same file.
 *
 */
export const controlPanelStyles = {
  /** Outer frame: slider+knobs row on top, trigger button centered underneath. */
  panel: css`
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: calc(var(--audioui-unit) / 4);
    padding: calc(var(--audioui-unit) / 4);
    border: 1px solid var(--accent-border);
    border-radius: 8px;
  `,

  /** Slider next to the stacked knob column. */
  controlsRow: css`
    display: flex;
    align-items: center;
  `,

  /**
   * The two instrument-specific knobs (Tone + Snappy/Decay), stacked
   * vertically next to the volume slider.
   */
  knobColumn: css`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  /**
   * Combined with `panel` via `classnames` when this instrument is the one
   * currently selected for step-pattern editing — see StepSequencer.tsx.
   */
  selected: css`
    border-color: var(--accent);
    border-width: 2px;
  `,
};
