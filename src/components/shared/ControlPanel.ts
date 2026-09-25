import { css } from "@linaria/core";

export const LABELED_SMALL_KNOB_HEIGHT_UNITS = 40;

export const VOLUME_MIN = 0;
export const VOLUME_MAX = 100;
export const PANNING_L = -100;
export const PANNING_R = 100;

export const formatPan = (value: number) => {
  if (value === 0) return "C";
  return value < 0 ? `L${Math.abs(value)}` : `R${value}`;
};

export const controlPanelStyles = {
  panel: css`
    padding: calc(var(--audioui-unit) / 4);
    border: 1px solid var(--accent-border);
    border-radius: 8px;
  `,

  selected: css`
    border-color: var(--accent);
    border-width: 2px;
    background: black;
  `,

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

  triggerWrap: css`
    position: relative;
    max-height: 48px;
  `,

  triggerLabel: css`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-h);
    pointer-events: none;
    user-select: none;
  `,

  triggerLabelActive: css`
    color: var(--bg);
  `,

  sequencerDot: css`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--border);
  `,

  sequencerDotActive: css`
    background: var(--contrast-1);
  `,
};
