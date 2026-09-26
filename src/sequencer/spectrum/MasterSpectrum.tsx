import { useEffect, useRef } from "react";
import { resolveScopeStrokeColor } from "../oscilloscope/scopeCanvas";
import {
  useMasterSpectrum,
  columnFrequency,
  SPECTRUM_COLUMN_COUNT,
  SPECTRUM_MIN_FREQ,
  SPECTRUM_MAX_FREQ,
} from "./useMasterSpectrum";
import {
  SPECTRUM_CANVAS_WIDTH,
  SPECTRUM_CANVAS_INITIAL_HEIGHT,
  spectrumWrapperClass,
  spectrumCanvasClass,
  DB_MIN,
  DB_MAX,
  FREQ_TICKS,
  FREQ_TICK_LABELS,
  getPlotBounds,
} from "./spectrumCanvas";

const formatFreqTick = (hz: number) =>
  hz >= 1000 ? `${hz / 1000}K` : `${hz}`;

const MasterSpectrum = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const getSpectrum = useMasterSpectrum();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrapper || !canvas || !ctx) return;

    // Observes the wrapper, not the canvas — see README — and resizes
    // the canvas's backing store to match, at devicePixelRatio for a
    // crisp (non-blurry) render.
    let logicalWidth = SPECTRUM_CANVAS_WIDTH;
    let logicalHeight = SPECTRUM_CANVAS_INITIAL_HEIGHT;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      logicalWidth = wrapper.clientWidth || SPECTRUM_CANVAS_WIDTH;
      logicalHeight = wrapper.clientHeight || SPECTRUM_CANVAS_INITIAL_HEIGHT;
      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);

    const strokeColor = resolveScopeStrokeColor(canvas);
    const textColor = getComputedStyle(canvas).getPropertyValue("--text").trim();

    let frameId: number;

    const draw = () => {
      const { left, right, top, bottom } = getPlotBounds(
        logicalWidth,
        logicalHeight,
      );
      const freqToX = (hz: number) => {
        const t =
          Math.log(hz / SPECTRUM_MIN_FREQ) /
          Math.log(SPECTRUM_MAX_FREQ / SPECTRUM_MIN_FREQ);
        return left + t * (right - left);
      };
      const dbToY = (db: number) => {
        const t = Math.min(1, Math.max(0, (db - DB_MIN) / (DB_MAX - DB_MIN)));
        return bottom - t * (bottom - top);
      };

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      // Axis ticks/labels first, so the curve draws on top.
      ctx.font = "9px sans-serif";
      ctx.fillStyle = textColor;
      ctx.strokeStyle = textColor;
      ctx.globalAlpha = 0.5;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      FREQ_TICKS.forEach((hz) => {
        const x = freqToX(hz);
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      ctx.textAlign = "left";
      [DB_MIN, DB_MAX].forEach((db) => {
        const y = dbToY(db);
        ctx.textBaseline = db === DB_MIN ? "bottom" : "top";
        ctx.fillText(`${db}`, 1, y);
      });

      ctx.textBaseline = "top";
      FREQ_TICK_LABELS.forEach((hz, i) => {
        // Edge labels would clip past the canvas if center-aligned —
        // anchor the first to its left edge and the last to its right.
        ctx.textAlign =
          i === 0
            ? "left"
            : i === FREQ_TICK_LABELS.length - 1
              ? "right"
              : "center";
        ctx.fillText(formatFreqTick(hz), freqToX(hz), bottom + 1);
      });

      // The spectrum curve: filled area under a line — see README.
      const spectrum = getSpectrum();
      ctx.beginPath();
      for (let column = 0; column < SPECTRUM_COLUMN_COUNT; column++) {
        const x = freqToX(columnFrequency(column));
        const y = dbToY(spectrum[column]);
        if (column === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.lineTo(freqToX(SPECTRUM_MAX_FREQ), bottom);
      ctx.lineTo(freqToX(SPECTRUM_MIN_FREQ), bottom);
      ctx.closePath();
      ctx.fillStyle = strokeColor;
      ctx.globalAlpha = 0.25;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      for (let column = 0; column < SPECTRUM_COLUMN_COUNT; column++) {
        const x = freqToX(columnFrequency(column));
        const y = dbToY(spectrum[column]);
        if (column === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [getSpectrum]);

  return (
    <div ref={wrapperRef} className={spectrumWrapperClass}>
      <canvas
        ref={canvasRef}
        width={SPECTRUM_CANVAS_WIDTH}
        height={SPECTRUM_CANVAS_INITIAL_HEIGHT}
        className={spectrumCanvasClass}
      />
    </div>
  );
};

export default MasterSpectrum;
