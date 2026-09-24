import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type * as Tone from "tone";
import {
  SCOPE_CANVAS_WIDTH,
  SCOPE_CANVAS_HEIGHT,
  scopeCanvasClass,
  resolveScopeStrokeColor,
} from "./scopeCanvas";

interface WaveformDisplayProps {
  waveformRef: RefObject<Tone.Waveform | null>;
}

/**
 * A live oscilloscope-style view of one voice's current waveform buffer —
 * reads whatever `waveformRef` points at (see `useScopeWaveform` in
 * lib/voiceScope.ts for how that persistent analyser gets populated; every
 * hit's ephemeral chain taps into it in parallel with the audible signal
 * path).
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

    const strokeColor = resolveScopeStrokeColor(canvas);

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
      width={SCOPE_CANVAS_WIDTH}
      height={SCOPE_CANVAS_HEIGHT}
      className={scopeCanvasClass}
    />
  );
};

export default WaveformDisplay;
