import { useEffect, useRef } from "react";
import {
  SCOPE_CANVAS_WIDTH,
  SCOPE_CANVAS_HEIGHT,
  scopeCanvasClass,
  resolveScopeStrokeColor,
} from "./scopeCanvas";

interface FullWaveformDisplayProps {
  data: Float32Array | null;
}

const FullWaveformDisplay = ({ data }: FullWaveformDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const strokeColor = resolveScopeStrokeColor(canvas);

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    if (!data || data.length === 0) return;

    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;

    for (let x = 0; x < width; x++) {
      const start = Math.floor((x / width) * data.length);
      const end = Math.floor(((x + 1) / width) * data.length);

      let min = data[start] ?? 0;
      let max = data[start] ?? 0;
      for (let i = start; i < end; i++) {
        const value = data[i];
        if (value < min) min = value;
        if (value > max) max = value;
      }

      const yMin = height / 2 + min * (height / 2);
      const yMax = height / 2 + max * (height / 2);
      ctx.moveTo(x + 0.5, yMin);
      ctx.lineTo(x + 0.5, yMax);
    }
    ctx.stroke();
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={SCOPE_CANVAS_WIDTH}
      height={SCOPE_CANVAS_HEIGHT}
      className={scopeCanvasClass}
    />
  );
};

export default FullWaveformDisplay;
