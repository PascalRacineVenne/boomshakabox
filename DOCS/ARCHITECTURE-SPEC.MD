# Drum Machine — Tone.js + React/TypeScript Architecture Spec

## Context

Step sequencer, 16 steps, 8 drum-style sound sources (tracks): Kick, Snare,
Tom1, Floor Tom, HH Closed, HH Open, Tom, Cymbal. (An FM synth voice was
considered but is explicitly deferred — see **Current status** below; it's a
melodic/sustained voice shape, not a one-shot percussive one, and doesn't
fit the pattern the rest of this doc describes.) Each track has
user-adjustable parameters (pitch, decay, filter cutoff, pan, etc.) that can be
tweaked **live during playback**, with immediate audible feedback. This is
**not** parameter automation over time (no per-step parameter envelopes/MIDI-style
automation) — just live knob manipulation of a current value.

## Non-negotiable principles

### 1. Scheduling

- Use `Tone.getTransport()` + a single `Tone.Sequence` or
  `Tone.getTransport().scheduleRepeat(...)` to drive all steps for every
  track. One scheduler, not one per track.
- Never use `setInterval`/`setTimeout` for playback timing. Tone's lookahead
  scheduler is sample-accurate regardless of JS main-thread/render jitter.
- UI playhead sync uses `Tone.getDraw().schedule(callback, time)`, never
  drives timing from `requestAnimationFrame` directly or from React state
  changes.

### 2. Node lifecycle

- Tone nodes (Players/Synths/Samplers) are created **once** at init/mount
  and kept alive for the session.
- The scheduled step callback only calls trigger methods
  (`triggerAttackRelease`, `.start()`) on pre-existing nodes.
- **Never instantiate a new Tone node inside the scheduled callback or inside
  a knob's onChange handler.** Node creation is the primary source of audio
  glitches/GC pauses.

> **⚠️ Known, deliberate exception — Kick and Snare.** `useKickVoice`/
> `useSnareVoice` (`src/components/voices/kick/`, `src/components/voices/snare/`) build a
> fresh `Tone.Oscillator`/`Tone.Gain`/`Tone.Distortion`/`Tone.Noise`/
> `Tone.Filter` chain on **every** `trigger()` call, including calls made
> from the sequencer's scheduled callback — the opposite of this rule.
>
> This was a conscious tradeoff, not an oversight: the requirement was to
> reuse the *exact* sound the standalone preview pads already used (see
> `ToneKickButton`/`ToneSnareButton`'s original hand-built recipes), and that
> recipe was written against raw, one-shot Web Audio nodes that can't be
> restarted after `.stop()` — the usual fix (persistent `Tone.MembraneSynth`/
> `Tone.NoiseSynth`-family instruments) would have meant re-deriving the
> sound rather than reusing it. For two short, low-tempo, one-shot voices
> this hasn't caused an audible problem in practice.
>
> **Revisit this once more tracks land.** At 8 tracks, some of which
> (Tom1/Floor Tom/HH Open in particular) may want longer, more overlapping
> envelopes, the GC/scheduling cost of constructing a full node graph per hit
> could start to matter — especially at higher tempos or when several tracks
> trigger on the same step. If glitches or performance problems show up,
> the fix is converting these `use<X>Voice` hooks to build their node graph
> once (in a mount effect) and expose a `trigger(time, params)` that only
> calls `.triggerAttackRelease()`/param writes on already-existing nodes —
> matching this rule properly. Don't assume the current approach scales
> just because it works today at 2 tracks.

### 3. State split — three distinct layers, not one

| Layer                                                                      | Storage                             | Written by                                                  | Read by                                                                                | Triggers re-render?                                                                     |
| -------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Pattern data (which steps are on, per track)                               | `useRef` (mutable array/2D array)   | step grid click handler                                     | scheduler callback                                                                     | No — pair with a display-only state slice if the grid needs to visually reflect toggles |
| Live params (current knob values per track)                                | `useRef` (mutable object per track) | knob onChange handler                                       | scheduler callback (applied at next trigger) + direct node write (applied immediately) | No                                                                                      |
| UI display state (knob rotation, playhead position, active-step highlight) | `useState`                          | derived from the same onChange handler / Tone.Draw callback | React render                                                                           | Yes — this is its _only_ job                                                            |

Rule of thumb: **if the audio scheduler needs to read it, it must not live in
`useState`.** `useState` updates are batched/async and not guaranteed to be
current at the moment the scheduler callback fires. Refs are read
synchronously with whatever was last written, which is what audio timing
needs.

> **How this is actually implemented for Kick/Snare.** Rather than a
> `liveParamsRef` holding raw primitive values per track (as the table above
> and the reference skeleton below suggest), `useStepSequencer.ts` syncs the
> whole **trigger closure** into a ref every render:
> `voicesRef.current = voices` inside a no-dependency `useEffect`. The knob
> values themselves live in ordinary `useState` inside each `use<X>Voice`
> hook — that's safe here specifically because those values are only ever
> read by *that same hook's own* `trigger` closure, not reached into
> directly by the scheduler. The scheduler only ever calls
> `voicesRef.current[id].trigger(time)`, so it's always calling the version
> of `trigger` that closes over the current knob values, without needing a
> separate ref per parameter. Same underlying rule (scheduler never reads
> stale `useState`), different concrete mechanism — follow *this* pattern
> for new tracks, not the raw-values-in-a-ref shape below.

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

Kick and Snare are both classified **one-shot/percussive** (documented in
their own `use<X>Voice.ts` files) — step 2 above is skipped entirely for
them.

## Reference skeleton

The illustrative shape below is still a reasonable *starting point* for a
generic N-track sequencer, but it's pseudocode for the general case, not a
description of the current codebase — see the side notes on rules 2 and 3
above for how Kick/Snare actually differ, and read
`src/sequencer/grid/useStepSequencer.ts` + `src/components/voices/kick/useKickVoice.ts`
for the real, current source of truth.

```tsx
// Created once, persistent for session lifetime
const synthsRef = useRef<Tone.Synth[]>([]); // length = number of tracks

// Pattern grid: [track][step] -> boolean (or velocity number)
const patternRef = useRef<boolean[][]>(
  Array.from({ length: trackCount }, () => Array(16).fill(false))
);

// Live parameter snapshot per track — mutable, read by scheduler
const liveParamsRef = useRef<TrackParams[]>(initialParamsForAllTracks);

// Display-only state, safe to re-render on
const [knobDisplay, setKnobDisplay] = useState<TrackParams[]>(initialParamsForAllTracks);
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

Tone.getTransport().scheduleRepeat((time) => {
  const step = /* current step index, wrapped 0..15 */;
  synthsRef.current.forEach((synth, t) => {
    if (patternRef.current[t][step]) {
      applyParamToNode(synth, /* relevant params */, liveParamsRef.current[t]);
      synth.triggerAttackRelease(/* note/duration */, time);
    }
  });
  Tone.getDraw().schedule(() => setCurrentStep(step), time);
}, "16n");
```

## Current status

**Built:**

- Kick and Snare voices (`src/components/voices/kick/`, `src/components/voices/snare/`),
  each a `use<X>Voice` hook (sound + live knob state) paired with a
  presentational `<X>Pad>` component.
- A single shared 16-step grid (`sequencer/StepGrid.tsx`) — one pattern per
  track, all always live/playing once the Transport starts; only one
  track's pattern is visible/editable at a time, switched by pressing that
  track's own pad.
- The scheduler (`sequencer/useStepSequencer.ts`) is driven by a
  `TRACK_IDS` array rather than hardcoded per-track fields — adding a track
  means adding its id there and passing its voice in, not touching the
  scheduler loop.
- Tempo, Transport (Start/Stop), and the metronome click/beat indicator,
  all synced to the one shared `Tone.getTransport()`.
- Per-instrument folder layout (`components/voices/<instrument>/`) established and
  ready to replicate for the remaining tracks.

**Not yet built:**

- Tom1, Floor Tom, HH Closed, HH Open, Tom, Cymbal voices.
- The master FX chain (filter/distortion/reverb/delay sends) and per-track
  pan/delay/reverb sends described in `ui-stack.md`'s v1 component mapping.
- The FM synth voice (deferred — see Context above).

**Known open issue:** there's an audio glitch on the very first manual pad
press each session (not yet reproduced on the sequencer's own scheduled
playback). The scheduling logic itself has been verified correct via
deterministic offline rendering, so the leading theory is a real-time
`AudioContext` cold-start artifact rather than a bug in the trigger code. A
best-effort mitigation (a silent warm-up tone) lives in
`src/lib/startAudioContext.ts`, but it hasn't been confirmed to actually
resolve what's being heard. Worth a fresh, focused pass before this ships
broadly.

## Checklist before implementation

- [ ] All nodes instantiated once, outside any render/callback (see the
      rule 2 side note for Kick/Snare's known exception)
- [ ] Pattern grid and live params live in refs, not state
- [ ] Only display-oriented values live in `useState`
- [ ] Knob handlers write ref + node + display state in one synchronous call
- [ ] AudioParam-backed values use `.rampTo`, not direct assignment, when live
- [ ] Per-track one-shot vs. sustained classification documented
- [ ] Single Transport-driven scheduler, no `setInterval`
- [ ] UI playhead sync via `Tone.getDraw()`, not raw
      `requestAnimationFrame`/state timers
