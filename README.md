# Boomshakabox

A browser-based drum machine. Eight synthesized drum voices (Kick, Snare,
Clap, Closed/Open Hi-Hat, Hi/Mid/Low Tom — every sound built from Tone.js
oscillators/noise/filters at trigger time, no samples), an up-to-64-step
sequencer, a shared effects chain (drive/filter, a hand-built ping-pong tape
delay, and a convolution reverb), and real-time oscilloscope + spectrum
visualizers. Built with React 19, TypeScript, and Tone.js.

## Running locally

```bash
npm install
npm run dev      # start the Vite dev server
```

Other scripts:

```bash
npm run build    # type-check (tsc -b) then production build
npm run lint      # eslint
npm run test      # jest
npm run preview   # preview a production build locally
```

## Deployment

[BOOMSHAKABOX](https://boomshakabox.vercel.app/)

## Documentation

- [`DOCS/ARCHITECTURE-SPEC.MD`](DOCS/ARCHITECTURE-SPEC.MD) — how the app is
  put together: voice architecture, the sequencer engine, hotkeys, the
  effects/master bus chain, and the visualizers, with a high-level diagram.
- **Voices** — signal-flow diagram and knob reference for each:
  [Kick](src/components/voices/kick/README.md) ·
  [Snare](src/components/voices/snare/README.md) ·
  [Clap](src/components/voices/clap/README.md) ·
  [Hi-Hat (Closed)](src/components/voices/hiHat/README.md) ·
  [Hi-Hat (Open)](src/components/voices/hiHatOpen/README.md) ·
  [Hi Tom](src/components/voices/hiTom/README.md) ·
  [Mid Tom](src/components/voices/midTom/README.md) ·
  [Low Tom](src/components/voices/lowTom/README.md)
- **Buses** — signal-flow diagram and knob reference for each:
  [Effects Bus](DOCS/buses/effects-bus.md) ·
  [Master Bus](DOCS/buses/master-bus.md) ·
  [Delay/Reverb Insert](DOCS/buses/delay-reverb-insert.md)
- **Visualizers**:
  [Oscilloscope](src/sequencer/oscilloscope/README.md) ·
  [Spectrum](src/sequencer/spectrum/README.md)
- [`DOCS/TONE-JS-SIGNAL-FLOW.md`](DOCS/TONE-JS-SIGNAL-FLOW.md) — general
  reference notes on conventional Tone.js signal-chain ordering (not
  specific to this app's own implementation).

## Tech stack

- **Build tool**: Vite
- **Framework**: React 19 + TypeScript
- **Audio**: Tone.js
- **Audio UI components**: [`@cutoff/audio-ui-react`](https://github.com/cutoff/audio-ui) (knobs, sliders, buttons)
- **Styling**: [Linaria](https://linaria.dev/) (zero-runtime CSS-in-JS) for everything custom-built, plus [Ant Design](https://ant.design/) for layout primitives
