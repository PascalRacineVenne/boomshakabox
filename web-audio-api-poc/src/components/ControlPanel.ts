import { css } from "@linaria/core";

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
 */
export const controlPanelStyles = {
  /** Outer frame: slider+knobs row on top, trigger button centered underneath. */
  panel: css`
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: calc(var(--audioui-unit) / 2);
    padding: calc(var(--audioui-unit) / 2);
    border: 1px solid var(--accent-border);
    border-radius: 8px;
  `,

  /** Slider next to the stacked knob column. */
  controlsRow: css`
    display: flex;
    align-items: center;
    gap: calc(var(--audioui-unit) / 2);
  `,

  /**
   * The two instrument-specific knobs (Tone + Snappy/Decay), stacked
   * vertically next to the volume slider.
   */
  knobColumn: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(var(--audioui-unit) / 4);
  `,
};
