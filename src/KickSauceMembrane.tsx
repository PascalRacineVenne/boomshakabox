import { useEffect, useId, useRef, useState } from "react";
import * as Tone from "tone"; // npm i tone

/**
 * FatKick — a tight, fat electronic bass drum with a bit of attack.
 *
 * Signal path:
 *   MembraneSynth (sine + fast pitch drop) -> Distortion -> lowpass -> makeup gain
 *     -> highpass (28 Hz) -> Compressor -> Limiter -> out
 *   NoiseSynth (short band-passed click) -> Gain -> Compressor   (skips the saturator)
 *
 * Props:
 *   theme: "auto" (follows the OS), "light" or "dark". Default "auto".
 *
 * Styles are scoped under .fk-root and injected by the component, so it has no
 * CSS or Tailwind dependencies. Requires React 18+ and tone 14.x.
 */

const DEFAULTS = {
  pitch: 48,
  punch: 5,
  decay: 0.32,
  click: 0.4,
  drive: 0.35,
  bpm: 128,
};

const SLIDERS = [
  {
    key: "pitch",
    label: "Pitch",
    min: 34,
    max: 72,
    step: 1,
    fmt: (v) => `${Math.round(v)} Hz`,
  },
  {
    key: "punch",
    label: "Punch",
    min: 2,
    max: 9,
    step: 0.1,
    fmt: (v) => `\u00D7${v.toFixed(1)}`,
  },
  {
    key: "decay",
    label: "Length",
    min: 0.12,
    max: 0.7,
    step: 0.01,
    fmt: (v) => `${v.toFixed(2)} s`,
  },
  {
    key: "click",
    label: "Click",
    min: 0,
    max: 1,
    step: 0.01,
    fmt: (v) => `${Math.round(v * 100)}%`,
  },
  {
    key: "drive",
    label: "Fatness",
    min: 0,
    max: 1,
    step: 0.01,
    fmt: (v) => `${Math.round(v * 100)}%`,
  },
];

const TEMPO = {
  key: "bpm",
  label: "Tempo",
  min: 80,
  max: 170,
  step: 1,
  fmt: (v) => `${Math.round(v)} BPM`,
};

function buildAudio(p) {
  const nodes = [];
  const add = (n) => (nodes.push(n), n);

  // Master chain
  const limiter = add(new Tone.Limiter(-1)).toDestination();
  const comp = add(
    new Tone.Compressor({
      threshold: -16,
      ratio: 4,
      attack: 0.003,
      release: 0.12,
    }),
  ).connect(limiter);
  const hp = add(new Tone.Filter(28, "highpass")).connect(comp);
  const makeup = add(new Tone.Gain(2.4)).connect(hp);
  const lp = add(new Tone.Filter(9000, "lowpass")).connect(makeup);

  // Body: sine with a fast downward pitch sweep, saturated for thickness
  const dist = add(
    new Tone.Distortion({ distortion: p.drive, oversample: "4x" }),
  ).connect(lp);
  const kick = add(
    new Tone.MembraneSynth({
      pitchDecay: 0.035,
      octaves: p.punch, // in Tone 14 this multiplies the start pitch (pitch x punch)
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: p.decay, sustain: 0, release: 0.05 },
    }),
  ).connect(dist);

  // Attack: a few ms of band-passed noise, kept out of the saturator so it stays crisp
  const clickFilter = add(new Tone.Filter(3200, "bandpass"));
  clickFilter.Q.value = 0.7;
  const clickGain = add(new Tone.Gain(p.click * 0.6));
  const click = add(
    new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.0005, decay: 0.012, sustain: 0 },
    }),
  ).chain(clickFilter, clickGain, comp);

  return { kick, click, dist, clickGain, nodes };
}

export default function KickSauceMembrane({ theme = "auto" }) {
  const uid = useId();
  const [params, setParams] = useState(DEFAULTS);
  const [looping, setLooping] = useState(false);
  const [error, setError] = useState("");

  const paramsRef = useRef(params);
  const audioRef = useRef(null);
  const loopIdRef = useRef(null);
  const headRef = useRef(null);
  const ringRef = useRef(null);

  // Keep refs and live audio params in sync with the sliders
  useEffect(() => {
    paramsRef.current = params;
    const a = audioRef.current;
    if (!a) return;
    a.kick.octaves = params.punch;
    a.kick.envelope.decay = params.decay;
    a.clickGain.gain.rampTo(params.click * 0.6, 0.02);
    a.dist.distortion = params.drive;
    Tone.Transport.bpm.value = params.bpm;
  }, [params]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (loopIdRef.current !== null) Tone.Transport.clear(loopIdRef.current);
      Tone.Transport.stop();
      audioRef.current?.nodes.forEach((n) => n.dispose());
      audioRef.current = null;
    };
  }, []);

  async function ensureAudio() {
    try {
      await Tone.start();
      if (!audioRef.current) audioRef.current = buildAudio(paramsRef.current);
      setError("");
      return true;
    } catch (e) {
      setError(
        "Audio could not start. Tap again, or check that sound is allowed in this browser.",
      );
      return false;
    }
  }

  function hit(time) {
    const a = audioRef.current;
    if (!a) return;
    const { pitch, decay } = paramsRef.current;
    a.kick.triggerAttackRelease(pitch, decay + 0.05, time);
    a.click.triggerAttackRelease(0.02, time);
  }

  function pulse() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { decay } = paramsRef.current;
    headRef.current?.animate(
      [{ transform: "scale(0.93)" }, { transform: "scale(1)" }],
      {
        duration: Math.max(140, decay * 1000),
        easing: "cubic-bezier(.2,.8,.2,1)",
      },
    );
    ringRef.current?.animate(
      [
        { transform: "scale(0.95)", opacity: 0.55 },
        { transform: "scale(1.3)", opacity: 0 },
      ],
      { duration: 460, easing: "ease-out" },
    );
  }

  async function tap() {
    if (!(await ensureAudio())) return;
    hit();
    pulse();
  }

  async function toggleLoop() {
    if (!(await ensureAudio())) return;
    const transport = Tone.Transport;
    if (looping) {
      transport.stop();
      if (loopIdRef.current !== null) {
        transport.clear(loopIdRef.current);
        loopIdRef.current = null;
      }
      setLooping(false);
    } else {
      transport.bpm.value = paramsRef.current.bpm;
      loopIdRef.current = transport.scheduleRepeat((time) => {
        hit(time);
        Tone.Draw.schedule(pulse, time);
      }, "4n");
      transport.start();
      setLooping(true);
    }
  }

  const setParam = (key) => (e) =>
    setParams((prev) => ({ ...prev, [key]: parseFloat(e.target.value) }));

  const renderSlider = (s) => {
    const id = `${uid}-${s.key}`;
    return (
      <div className="fk-row" key={s.key}>
        <label htmlFor={id}>{s.label}</label>
        <output htmlFor={id}>{s.fmt(params[s.key])}</output>
        <input
          id={id}
          type="range"
          min={s.min}
          max={s.max}
          step={s.step}
          value={params[s.key]}
          onChange={setParam(s.key)}
        />
      </div>
    );
  };

  return (
    <div className="fk-root" data-theme={theme}>
      <style>{CSS}</style>
      <div className="fk-main">
        <h1>Fat kick</h1>
        <p className="fk-sub">
          Tight, thick, a little snap on the front. Tap the drum.
        </p>

        <div className="fk-stage">
          <div className="fk-ring" ref={ringRef} />
          <button
            type="button"
            className="fk-head"
            ref={headRef}
            aria-label="Hit the kick drum"
            onPointerDown={(e) => {
              e.preventDefault();
              tap();
            }}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                if (!e.repeat) tap();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") e.preventDefault();
            }}
          >
            Hit
          </button>
        </div>

        {SLIDERS.map(renderSlider)}

        <div className="fk-loop">
          <button type="button" aria-pressed={looping} onClick={toggleLoop}>
            {looping ? "Stop" : "Play four on the floor"}
          </button>
          {renderSlider(TEMPO)}
        </div>

        <p className="fk-note" role="status">
          {error}
        </p>
      </div>
    </div>
  );
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&display=swap");
 
.fk-root {
  --bg: #E8EDF3;
  --ink: #0F1E2C;
  --muted: #51657A;
  --accent: #2B5BFF;
  --accent-ink: #FFFFFF;
  --track: #C3CEDA;
  --line: #CBD5E0;
  box-sizing: border-box;
  min-height: 100%;
  background: var(--bg);
  color: var(--ink);
  font-family: "Bricolage Grotesque", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
@media (prefers-color-scheme: dark) {
  .fk-root:not([data-theme="light"]) {
    --bg: #0B1520;
    --ink: #E7EEF6;
    --muted: #8DA0B5;
    --accent: #4F7DFF;
    --accent-ink: #06101D;
    --track: #24374B;
    --line: #1F3145;
  }
}
.fk-root[data-theme="dark"] {
  --bg: #0B1520;
  --ink: #E7EEF6;
  --muted: #8DA0B5;
  --accent: #4F7DFF;
  --accent-ink: #06101D;
  --track: #24374B;
  --line: #1F3145;
}
.fk-root *, .fk-root *::before, .fk-root *::after { box-sizing: inherit; }
 
.fk-main { max-width: 460px; margin: 0 auto; padding: 22px 22px 40px; overflow-x: clip; }
.fk-root h1 { margin: 0; font-size: 34px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.05; }
.fk-sub { margin: 6px 0 0; color: var(--muted); font-size: 15px; line-height: 1.4; }
 
.fk-stage { position: relative; width: min(70vw, 290px); aspect-ratio: 1; margin: 30px auto 36px; }
.fk-ring {
  position: absolute; inset: 0; border-radius: 50%;
  border: 2px solid var(--accent); opacity: 0; pointer-events: none;
}
.fk-head {
  position: relative; width: 100%; height: 100%; padding: 0; border: 0; border-radius: 50%;
  background: var(--accent); color: var(--accent-ink);
  font: inherit; font-size: 26px; font-weight: 800; letter-spacing: -0.01em;
  cursor: pointer;
  box-shadow: 0 0 0 8px var(--bg), 0 0 0 11px var(--ink);
  touch-action: manipulation; user-select: none; -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.fk-head::after {
  content: ""; position: absolute; inset: 13%; border-radius: 50%;
  border: 2px solid currentColor; opacity: 0.28; pointer-events: none;
}
.fk-head:focus-visible { outline: 3px solid var(--ink); outline-offset: 18px; }
 
.fk-row { display: grid; grid-template-columns: 1fr auto; align-items: baseline; margin-bottom: 8px; }
.fk-row label { font-size: 16px; font-weight: 600; }
.fk-row output { font-size: 15px; color: var(--muted); font-variant-numeric: tabular-nums; }
.fk-row input[type=range] {
  grid-column: 1 / -1; width: 100%; height: 32px; margin: 0;
  background: transparent; -webkit-appearance: none; appearance: none; touch-action: pan-y;
}
.fk-row input[type=range]::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; background: var(--track); }
.fk-row input[type=range]::-moz-range-track { height: 4px; border-radius: 2px; background: var(--track); }
.fk-row input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 24px; height: 24px; margin-top: -10px; border-radius: 50%;
  background: var(--accent); border: 3px solid var(--bg); box-shadow: 0 0 0 1px var(--accent);
}
.fk-row input[type=range]::-moz-range-thumb {
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--accent); border: 3px solid var(--bg); box-shadow: 0 0 0 1px var(--accent);
}
.fk-row input[type=range]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
 
.fk-loop { margin-top: 26px; padding-top: 22px; border-top: 1px solid var(--line); }
.fk-loop > button {
  width: 100%; height: 50px; margin-bottom: 14px; border-radius: 25px;
  border: 2px solid var(--ink); background: transparent; color: var(--ink);
  font: inherit; font-size: 16px; font-weight: 600; cursor: pointer;
  touch-action: manipulation; -webkit-tap-highlight-color: transparent;
}
.fk-loop > button[aria-pressed="true"] { background: var(--ink); color: var(--bg); }
.fk-loop > button:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
 
.fk-note { margin: 18px 0 0; color: var(--muted); font-size: 14px; min-height: 1.4em; }
`;
