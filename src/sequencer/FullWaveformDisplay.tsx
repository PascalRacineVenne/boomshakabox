import { useEffect, useRef } from "react";
import { css } from "@linaria/core";

const WIDTH = 160;
const HEIGHT = 130; // matches WaveformDisplay's own size, so the pair reads as one row

const styles = {
  canvas: css`
    border: 1px solid var(--accent-border);
    border-radius: 8px;
    background: black;
  `,
};

interface FullWaveformDisplayProps {
  data: Float32Array | null;
}

/**
 * A complete, static picture of one full hit — unlike WaveformDisplay's
 * live rolling analyser window (only ever a few ms of "right now"), this
 * data comes from an offline render of the entire hit (see
 * useKickVoice.ts's renderKickFullWaveform), so the whole duration can be
 * drawn at once, closer to how a sample browser shows a pre-recorded file.
 */
const FullWaveformDisplay = ({ data }: FullWaveformDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const strokeColor = getComputedStyle(canvas)
      .getPropertyValue("--contrast-1")
      .trim();

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    if (!data || data.length === 0) return;

    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;

    // A full hit is tens of thousands of samples, far more than this canvas
    // has pixels, so plot each column's min/max (like a DAW's waveform
    // view) rather than one point per sample — preserves peaks that a naive
    // every-Nth-sample readout would miss.
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
      width={WIDTH}
      height={HEIGHT}
      className={styles.canvas}
    />
  );
};

export default FullWaveformDisplay;
