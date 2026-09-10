# Alternatives to Raw Web Audio API (React + TypeScript)

The Web Audio API (what [src/App.tsx](src/App.tsx) uses today) is the low-level foundation
every audio library in the browser is built on. Most "alternatives" don't replace it —
they wrap it with higher-level abstractions (prebuilt synths, ADSR objects, a sequencer
clock) so you write less node-graph boilerplate. A few replace specific pieces (sample
playback, effects, or the whole DSP engine). This doc lists the realistic options for a
React + TS project and where each one fits.

## Quick decision guide

| If you want... | Reach for |
|---|---|
| Prebuilt synths with ADSR/filter/LFO already wired up, less boilerplate than raw nodes | **Tone.js** |
| A declarative, JSX-style step sequencer/drum machine UI | **Reactronica** (built on Tone.js) |
| To play back real recorded drum samples instead of synthesizing | **Howler.js** / **use-sound** |
| Rock-solid, spec-compliant `AudioContext` behavior + strong TS types, but still hand-write nodes like today | **standardized-audio-context** |
| A grab-bag of extra effects (distortion, chorus, wah) to bolt onto existing Web Audio nodes | **Tuna.js** |
| A React-like "describe the graph as a function of state" mental model | **Elementary Audio** |
| To design custom DSP in a dedicated audio language, compiled to WASM | **Faust** |
| Maximum control over custom, sample-accurate DSP | **AudioWorklet + Rust/C → WASM** |
| To reuse a patch built visually in Max/MSP | **RNBO** |

---

## Tone.js

The de facto standard higher-level library over Web Audio API. TypeScript types ship
built in.

- `Tone.MembraneSynth` / `Tone.NoiseSynth` / `Tone.Synth` are prebuilt drum-voice
  patterns — most of what our hand-rolled snare code does (oscillators → filter → gain
  envelope) already exists as a constructor with named options.
- `envelope: { attack, decay, sustain, release }` replaces manually scheduling
  `.gain.exponentialRampToValueAtTime(...)` calls — it's the ADSR section from the drum
  machine map as an actual object.
- `Tone.Filter` wraps `BiquadFilterNode` with the same `type`/`frequency`/`Q`, plus an
  easier-to-automate envelope via `Tone.FrequencyEnvelope`.
- `Tone.LFO` is an actual LFO object (rate, min/max, type) instead of hand-wiring a
  second oscillator into a gain node into a param.
- `Tone.Distortion` (saturation), `Tone.FeedbackDelay` (delay + feedback in one node),
  `Tone.Reverb` (convolution reverb, generates its own impulse response) — each maps to
  a whole section of the previous drum-machine-map doc in a single line of code.
- `Tone.Transport` + `Tone.Sequence`/`Tone.Part` gives you a real sequencer clock —
  the current button in this project is a manual one-shot trigger with no scheduling;
  Tone.Transport is what you'd reach for to turn this into an actual step sequencer.

Tradeoff: it's an added dependency and its own abstraction layer — you're no longer
looking directly at the node graph, which is less ideal if the goal of this repo is to
learn Web Audio API itself.

## Reactronica

A React component library (`<Song>`, `<Track>`, `<Instrument>`, `<StepSequencer>`) built
on top of Tone.js, letting you describe a sequencer/drum machine declaratively in JSX
instead of imperative Tone.js/Web Audio calls.

- Good fit if the end goal is a composition/sequencer UI rather than deep custom sound
  design — it trades fine-grained control for speed of building the interface.
- Still Tone.js underneath, so you can drop down to raw Tone.js (or raw Web Audio) for
  anything the components don't expose.

## Tuna.js

A small effects-only library that adds nodes Web Audio doesn't ship natively —
`Tuna.Overdrive` (saturation), `Tuna.Chorus`, `Tuna.WahWah`, `Tuna.Convolver` — each
implemented as a wrapper around a Web Audio node graph you can `.connect()` into an
existing chain (raw Web Audio *or* Tone.js).

- Use this only for the effects gap, not as a replacement for oscillators/envelopes.

## Howler.js / use-sound

Howler.js is a sample-playback library (load an audio file, play/pause/loop/fade,
manage a pool of simultaneous sounds) — closer to a game-audio engine than a synth.
`use-sound` is a small React hook wrapper around it (`const [play] = useSound(url)`).

- The right choice if your "drum machine" plays back real recorded 808/909 sample packs
  (`.wav`/`.mp3` files) rather than synthesizing waveforms from scratch.
- No ADSR, no filter, no LFO — it's a player, not a synthesis engine. You'd still reach
  for Web Audio/Tone.js for anything on the drum-machine-map doc beyond "press pad, hear
  sample."

## standardized-audio-context

A spec-compliant, fully-typed drop-in for the native `AudioContext` that patches
cross-browser inconsistencies (older Safari quirks, prefixed APIs) and can even run
under Node.js (useful for unit-testing audio code, or SSR safety) via a mock
implementation.

- Doesn't add synthesis abstractions — you keep writing the same
  `createOscillator()`/`createGain()` style code as today, just against a more
  consistent, better-typed contract.
- Worth it if you want to keep the low-level, learn-the-API approach this project has
  taken so far, but want stronger guarantees it behaves the same in every browser and
  in tests.

## Elementary Audio (`@elemaudio/core` + `@elemaudio/web-renderer`)

A functional, declarative audio engine: instead of imperatively building and
`.connect()`-ing a node graph, you describe the desired audio graph as a pure function
of your app's state, and the library diffs it against the previous graph and patches
the difference — conceptually the same model as React's virtual DOM diffing.

- Appeals specifically to React developers because the mental model (declare, don't
  mutate; re-render on state change) matches how you already think about UI.
- Actual DSP runs inside a WASM `AudioWorklet` under the hood for performance.
- Different enough paradigm from both raw Web Audio and Tone.js that it's a bigger
  conceptual jump, not just a drop-in swap.

## Faust (via `faustwasm` / `faust2webaudio`)

A textual DSP language from academia/pro-audio research, compiled to WebAssembly. You
write a short DSP script (e.g. an actual 808 snare circuit model, oscillators + noise +
filters + envelopes expressed as signal-processing equations) and Faust's toolchain
generates a ready-to-use Web Audio node — optionally with an auto-generated UI for its
parameters.

- Worth it when stock `BiquadFilterNode`/`WaveShaperNode` primitives aren't precise
  enough and you want to model specific analog circuit behavior mathematically.
- Steep-ish learning curve (new language), but there's a large library of open-source
  Faust drum-synthesis examples to start from rather than writing DSP math from scratch.

## AudioWorklet + Rust/C → WASM (roll your own)

The "no library" option for genuinely custom, sample-accurate DSP that nothing above
covers — custom noise coloring, a bitcrusher, an unusual envelope shape, a from-scratch
circuit model. Write the DSP in Rust (e.g. with the `fundsp` crate) or C, compile to
WASM with `wasm-pack`/Emscripten, and run it inside an `AudioWorkletProcessor`.

- Most control, most effort. Usually only worth reaching for once you've outgrown what
  Tone.js and stock Web Audio nodes can do.

## RNBO (Cycling '74)

Lets you build a patch visually in Max/MSP (or RNBO's own patcher) and export it
directly to a JS/WASM module that drops into a web project.

- Useful if you or a sound designer on the project prefer visual patching over writing
  JS/TS for DSP, or want to reuse an existing Max/MSP synthesis patch as-is.

---

## Recommendation for this project specifically

[src/App.tsx](src/App.tsx) currently hand-rolls the snare voice directly against Web
Audio API, and [WEB-AUDIO-API-DRUM-MACHINE-MAP.md](WEB-AUDIO-API-DRUM-MACHINE-MAP.md)
maps every hardware knob to the raw node/param that implements it. Two reasonable paths
from here:

- **Keep raw Web Audio API** if the explicit point of this repo is learning/demonstrating
  the low-level primitives — which, based on the work so far, it clearly is.
- **Migrate to Tone.js** once you want less boilerplate or an actual step sequencer:
  `Tone.NoiseSynth` + `Tone.MembraneSynth` cover most of the current snare/kick
  synthesis in a few constructor options, `envelope` replaces manual gain automation,
  and `Tone.Transport` gives you real scheduling instead of a single trigger button.
