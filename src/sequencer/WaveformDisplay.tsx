import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type * as Tone from "tone";
import { css } from "@linaria/core";

const WIDTH = 160;
const HEIGHT = 130; // roughly matches MiniGrid's own height, so the row reads evenly

const styles = {
  canvas: css`
    border: 1px solid var(--accent-border);
    border-radius: 8px;
    background: black;
  `,
};

interface WaveformDisplayProps {
  waveformRef: RefObject<Tone.Waveform | null>;
}

/**
 * Prototype: a live oscilloscope-style view of one voice's current
 * waveform buffer — reads whatever `waveformRef` points at (see
 * `useKickVoice.ts`'s own `waveformRef` for how that persistent analyser
 * gets populated; every hit's ephemeral chain taps into it in parallel
 * with the audible signal path).
 *
 * Draws continuously via `requestAnimationFrame`, deliberately NOT
 * `Tone.Draw` — that's for syncing UI updates to precise
 * Transport-scheduled times (the step playhead); this has no scheduled
 * event to sync to, it's just "redraw whatever's currently in the
 * analyser buffer, every frame," the standard case `requestAnimationFrame`
 * is actually for.
 */
const WaveformDisplay = ({ waveformRef }: WaveformDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Canvas doesn't reliably resolve CSS custom properties across engines
    // when passed straight to strokeStyle, so resolve --contrast-1 to a
    // concrete color once up front instead.
    const strokeColor = getComputedStyle(canvas)
      .getPropertyValue("--contrast-1")
      .trim();

    let frameId: number;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const values = waveformRef.current?.getValue();
      if (values) {
        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        values.forEach((value, i) => {
          const x = (i / (values.length - 1)) * width;
          const y = height / 2 + value * (height / 2);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }

      frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [waveformRef]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      className={styles.canvas}
    />
  );
};

export default WaveformDisplay;
