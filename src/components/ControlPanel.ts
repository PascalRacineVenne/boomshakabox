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
 * Every one of these rows/columns is a plain AntD `Flex` at each call site
 * now (`<Flex vertical align="center">` for the outer panel and the knob
 * column, `<Flex align="center">` for the slider+knob-column row) rather
 * than a class here — only chrome `Flex`'s props can't express
 * (gap/padding/border/etc.) still needs one.
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
    gap: calc(var(--audioui-unit) / 4);
    padding: calc(var(--audioui-unit) / 4);
    border: 1px solid var(--accent-border);
    border-radius: 8px;
  `,

  /**
   * Combined with `panel` via `classnames` when this instrument is the one
   * currently selected for step-pattern editing — see StepSequencer.tsx.
   */
  selected: css`
    border-color: var(--accent);
    border-width: 2px;
    background: black;
  `,

  /** A small square letter-toggle — e.g. Mute ("M"), Solo ("S") — same shape/behavior either way. */
  toggleButton: css`
    width: 20px;
    height: 20px;
    margin-top: 8px;
    border: 1px solid var(--accent-border);
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
    color: var(--text);
    cursor: pointer;
    user-select: none;
  `,

  toggleButtonActive: css`
    border-color: var(--contrast-1);
    background: var(--contrast-1);
    color: var(--bg);
  `,
};
