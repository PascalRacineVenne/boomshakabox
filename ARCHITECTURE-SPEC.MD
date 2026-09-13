# Drum Machine — Tone.js + React/TypeScript Architecture Spec

## Context

Step sequencer, 16 or 32 steps, 10 sound sources (tracks). Each track has
user-adjustable parameters (pitch, decay, filter cutoff, pan, etc.) that can be
tweaked **live during playback**, with immediate audible feedback. This is
**not** parameter automation over time (no per-step parameter envelopes/MIDI-style
automation) — just live knob manipulation of a current value.

## Non-negotiable principles

### 1. Scheduling

- Use `Tone.Transport` + a single `Tone.Sequence` or `Transport.scheduleRepeat`
  to drive all steps for all 10 tracks. One scheduler, not one per track.
- Never use `setInterval`/`setTimeout` for playback timing. Tone's lookahead
  scheduler is sample-accurate regardless of JS main-thread/render jitter.
- UI playhead sync uses `Tone.Draw.schedule(callback, time)`, never drives
  timing from `requestAnimationFrame` directly or from React state changes.

### 2. Node lifecycle

- All 10 Tone nodes (Players/Synths/Samplers) are created **once** at
  init/mount and kept alive for the session.
- The scheduled step callback only calls trigger methods
  (`triggerAttackRelease`, `.start()`) on pre-existing nodes.
- **Never instantiate a new Tone node inside the scheduled callback or inside
  a knob's onChange handler.** Node creation is the primary source of audio
  glitches/GC pauses.

### 3. State split — three distinct layers, not one

| Layer                                                                      | Storage                             | Written by                                                  | Read by                                                                                | Triggers re-render?                                                                     |
| -------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Pattern data (which steps are on, per track)                               | `useRef` (mutable array/2D array)   | step grid click handler                                     | scheduler callback                                                                     | No — pair with a display-only state slice if the grid needs to visually reflect toggles |
| Live params (current knob values per track)                                | `useRef` (mutable object per track) | knob onChange handler                                       | scheduler callback (applied at next trigger) + direct node write (applied immediately) | No                                                                                      |
| UI display state (knob rotation, playhead position, active-step highlight) | `useState`                          | derived from the same onChange handler / Tone.Draw callback | React render                                                                           | Yes — this is its _only_ job                                                            |

Rule of thumb: **if the audio scheduler needs to read it, it must not live in
`useState`.** `useState` updates are batched/async and not guaranteed to be
current at the moment the scheduler callback fires. Refs are read
synchronously with whatever was last written, which is what audio timing
needs.

### 4. Live knob updates during playback

Every knob `onChange` handler does three things, in this order, in the same
synchronous event:

1. **Write to the live-params ref** — source of truth, read by the _next_
   scheduled step trigger for that track.
2. **Write directly to the live Tone node** — makes an already-sounding voice
   change _right now_ (matters for sustained/held sounds; for pure one-shot
   drum hits this step can be skipped since only the next trigger matters).
3. **Write to a `useState` slice purely for the knob's own visual position.**
   This is the only one allowed to cause a re-render.
   Do not gate step 1 or step 2 behind a React render. The audio write must be
   imperative and immediate.

### 5. Avoiding zipper noise / clicks on live changes

- Any parameter backed by an actual `AudioParam`/`Tone.Signal` (frequency,
  detune, filter cutoff, gain, pan) must be updated with
  `.rampTo(value, ~0.01–0.03s)`, never a raw `.value =` assignment, when
  changed live during playback.
- Plain JS properties on a node (envelope attack/decay/release times,
  oscillator type, waveform choice) can be assigned directly — they only take
  effect on the next envelope trigger, so no ramping needed.

### 6. Per-track classification

Before wiring up a track's params, classify it:

- **One-shot / percussive** (most drum hits): knob changes only need to reach
  the live-params ref. They apply on the next trigger. No direct node write
  needed mid-sound.
- **Sustained / long envelope / looping sample / drone**: knob changes need
  the direct node write (step 2 above) to be audible while the sound is
  already playing, in addition to updating the ref for future triggers.
  This classification should be decided once per track/source and documented,
  not re-derived ad hoc.

## Reference skeleton

```tsx
// Created once, persistent for session lifetime
const synthsRef = useRef<Tone.Synth[]>([]); // length 10

// Pattern grid: [track][step] -> boolean (or velocity number)
const patternRef = useRef<boolean[][]>(
  Array.from({ length: 10 }, () => Array(16).fill(false))
);

// Live parameter snapshot per track — mutable, read by scheduler
const liveParamsRef = useRef<TrackParams[]>(initialParamsFor10Tracks);

// Display-only state, safe to re-render on
const [knobDisplay, setKnobDisplay] = useState<TrackParams[]>(initialParamsFor10Tracks);
const [currentStep, setCurrentStep] = useState(0);

const applyParamToNode = (synth: Tone.Synth, param: keyof TrackParams, value: number) => {
  switch (param) {
    case "filterFreq":
    case "pitch":
    case "pan":
      // AudioParam-backed -> ramp to avoid clicks
      (synth as any)[param === "pitch" ? "detune" : param].rampTo(value, 0.02);
      break;
    case "decay":
    case "attack":
      // plain envelope property -> direct assign, takes effect next trigger
      synth.envelope[param] = value;
      break;
  }
};

const handleKnobChange = (trackIndex: number, param: keyof TrackParams, value: number) => {
  liveParamsRef.current[trackIndex][param] = value;              // 1. ref write
  applyParamToNode(synthsRef.current[trackIndex], param, value); // 2. direct node write (if sustained)
  setKnobDisplay((prev) => {
    const next = [...prev];
    next[trackIndex] = { ...next[trackIndex], [param]: value };
    return next;
  });                                                             // 3. visual only
};

Tone.Transport.scheduleRepeat((time) => {
  const step = /* current step index, wrapped 0..15 or 0..31 */;
  synthsRef.current.forEach((synth, t) => {
    if (patternRef.current[t][step]) {
      applyParamToNode(synth, /* relevant params */, liveParamsRef.current[t]);
      synth.triggerAttackRelease(/* note/duration */, time);
    }
  });
  Tone.Draw.schedule(() => setCurrentStep(step), time);
}, "16n");
```

## Checklist before implementation

- [ ] All 10 nodes instantiated once, outside any render/callback
- [ ] Pattern grid and live params live in refs, not state
- [ ] Only display-oriented values live in `useState`
- [ ] Knob handlers write ref + node + display state in one synchronous call
- [ ] AudioParam-backed values use `.rampTo`, not direct assignment, when live
- [ ] Per-track one-shot vs. sustained classification documented
- [ ] Single Transport-driven scheduler, no `setInterval`
- [ ] UI playhead sync via `Tone.Draw`, not raw `requestAnimationFrame`/state timers
