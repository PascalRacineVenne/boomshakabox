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
