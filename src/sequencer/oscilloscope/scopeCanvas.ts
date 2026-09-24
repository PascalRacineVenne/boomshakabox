import { css } from "@linaria/core";

// Shared by WaveformDisplay and FullWaveformDisplay so the two views read
// as one consistent row.
export const SCOPE_CANVAS_WIDTH = 160;
export const SCOPE_CANVAS_HEIGHT = 130; // roughly matches MiniGrid's own height

export const scopeCanvasClass = css`
  border: 1px solid var(--accent-border);
  border-radius: 8px;
  background: black;
`;

// Canvas doesn't reliably resolve CSS custom properties across engines when
// passed straight to strokeStyle, so resolve --contrast-1 to a concrete
// color once up front instead.
export const resolveScopeStrokeColor = (canvas: HTMLCanvasElement) =>
  getComputedStyle(canvas).getPropertyValue("--contrast-1").trim();
