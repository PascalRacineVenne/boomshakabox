# Drum Machine — UI Stack Spec (Vite + @cutoff/audio-ui-react + Linaria)

## Relationship to the architecture doc

This file covers **UI stack and component choices only**. Audio scheduling,
state-layer split (pattern/live-params/display), and the live-knob-update
pattern live in `drum-machine-architecture.md` — that logic does not change
based on which UI library draws the knobs, and should not be duplicated here.

**The one bridging rule between the two docs:**
Every `Knob`/`Slider`/`Button` component's `onChange` handler must call into
the same three-step write described in the architecture doc — (1) write to
`liveParamsRef`, (2) write directly to the live Tone node, (3) update
component/display state for the visual only. `audio-ui-react` components must
never own the audio-relevant value in local component state; they are visual
controllers over refs that live outside React's render cycle.
`onChange` receives an `AudioControlEvent` — extract the raw value via
`(e) => handleChange(e.value)`, not by storing the event object.

## Stack

- **Build tool**: Vite
- **Framework**: React 19 + TypeScript (peer deps: React 18.2+ or 19)
- **Audio UI components**: `@cutoff/audio-ui-react` (github.com/cutoff/audio-ui),
  installed as a normal npm package: `pnpm add @cutoff/audio-ui-react`
- **Styling for custom-built pieces**: Linaria — zero-runtime CSS-in-JS,
  extracted to static CSS at build time. Used for the step sequencer grid,
  Transport, and per-track strip layout (i.e. everything not already covered
  by `audio-ui-react`'s own components).

## Important: this is a real dependency, with real caveats

`@cutoff/audio-ui-react` is a standard installed package, not copied source:

- **Project status is "Developer Preview."** Core component APIs (Knob,
  Slider, Button, CycleButton, Keys) are marked stable/production-ready, but
  the library as a whole is still evolving — breaking changes can occur
  before a 1.0 release. Pin to a specific version rather than using a loose
  semver range.
- **License: dual GPL-3.0 / Commercial.** Free to use under GPL-3.0 for this
  project (personal/portfolio, presumed open-source on GitHub). A commercial
  license would only be needed if the project later became closed-source or
  was sold.

## Styling model

- `audio-ui-react` ships its own stylesheet
  (`import "@cutoff/audio-ui-react/style.css"`) and themes via CSS variables
  (`--audioui-unit` controls sizing) plus a `ThemeManager` (primary color,
  roundness). Dark mode toggles via a `.dark` class on an ancestor element.
- Custom-built pieces are styled with Linaria (`css` / `styled` tagged
  templates), extracted at build time — same "static, no runtime cost" model
  discussed earlier for this project.
- To keep custom pieces visually consistent with the library's own
  components, Linaria styles should reference the same CSS custom properties
  (`--audioui-unit`, theme colors) rather than hardcoding separate values —
  one shared set of design tokens across both.
- Dynamic/continuously-variable values (step highlight, drag-driven visual
  feedback in custom components) still use inline `style={}` where a static
  Linaria class can't express a runtime-computed value — same reasoning as
  any static CSS-extraction approach.

## Setup order

1. Scaffold Vite + React + TS project
2. `pnpm add @cutoff/audio-ui-react react@^19.0.0 react-dom@^19.0.0`
3. Import the stylesheet once at app root: `import "@cutoff/audio-ui-react/style.css"`
4. Install and configure Linaria for the Vite build
5. Set `--audioui-unit` and any `ThemeManager` config to match your visual
   direction before building out individual controls, and reuse those same
   variables in Linaria styles for custom components

## v1 component mapping

| Feature                                    | Component                                                                                        | Notes                                                                                                                                                                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Master volume                              | `Slider` (vertical)                                                                              | No separate Fader component in this library — `Slider` covers linear horizontal/vertical adjustment                                                                                                                                                       |
| Transport (Play/Stop)                      | **Custom-built** from `Button`, styled with Linaria                                              | No built-in Transport component — compose play/stop from toggle/momentary `Button` instances                                                                                                                                                              |
| Master filter cutoff                       | `Knob`                                                                                           | Generic Knob wired to master filter node                                                                                                                                                                                                                  |
| Master resonance                           | `Knob`                                                                                           | Generic Knob, same filter node                                                                                                                                                                                                                            |
| Master distortion                          | `Knob`                                                                                           | Generic Knob wired to distortion node (+ optional `Button` toggle for on/off)                                                                                                                                                                             |
| Master reverb send                         | `Knob` or `Slider`                                                                               | UI control only — actual reverb DSP is `Tone.Reverb`                                                                                                                                                                                                      |
| Master delay send                          | `Knob`                                                                                           | UI control only — actual delay DSP is `Tone.FeedbackDelay` or similar                                                                                                                                                                                     |
| Per-track strip ×6                         | **Custom-built** from `Slider` + `Knob`, layout styled with Linaria                              | No bundled channel-strip component in this library. See per-instrument breakdown below.                                                                                                                                                                   |
| Step sequencer grid (≤64 steps × 6 tracks) | `Button` (toggle mode) or `CycleButton` (LED-indicator variant), grid layout styled with Linaria | `Button` supports toggle (not just momentary) mode — fits a step's on/off state directly. `CycleButton`'s LED-indicator visual variant is a strong aesthetic fit for a hardware-style step light. Pick one and use it consistently across the whole grid. |

## Per-track strip — shared base + instrument-specific controls

Every strip shares the same base controls, then adds 1–2 instrument-specific
knobs on top. The strip is **not** a fixed-prop component — it should be
driven by a per-track config so the extra knob(s) render conditionally per
instrument, rather than every track carrying unused slots.

**Shared base (all 6 tracks):** Volume (`Slider`), Pan (`Knob`), Delay send
(`Knob`), Reverb send (`Knob`)

| Track     | Instrument-specific controls |
| --------- | ---------------------------- |
| Kick      | Tone, Decay                  |
| Snare     | Tone, Snappy                 |
| HH Closed | Tone                         |
| HH Open   | Tone, Decay                  |
| Tom       | Tuning                       |
| Cymbal    | Tone, Decay                  |

Implementation notes:

- All instrument-specific controls (Tone, Decay, Snappy, Tuning) are still
  generic `Knob` instances — there is no dedicated "Tone knob" or "Decay
  knob" component. The difference between them is which Tone.js node
  parameter each knob writes to, not a UI component difference.
- Each label (Tone, Decay, Snappy, Tuning) needs to be mapped to an actual
  Tone.js synth/parameter before implementation — e.g. "Snappy" on a snare
  typically maps to a noise-layer mix or filter character rather than a
  literal Tone.js property name. This mapping is not yet defined and should
  be decided per voice before coding the strip.
- Whatever key each control maps to must match the key used in
  `liveParamsRef` for that track (see `drum-machine-architecture.md`) so the
  knob's `onChange` writes to the correct param without a translation layer
  in the component itself.

## Explicitly out of scope for v1

- Per-track LFO assignment (target param selector + rate/depth knobs)
- Per-track velocity modulation (target param selector + amount knob)
  Both deferred to a later version — revisit once core sequencing/playback and
  master FX chain are solid.

## Practical notes

- `@cutoff/audio-ui-react` components are themed via CSS variables and a
  ThemeManager — customize color/roundness through that system rather than
  overriding classes.
- Because this is a real npm dependency (not copied source), keep it pinned
  to a specific version given its Developer Preview status, and check the
  changelog before bumping versions.
- Custom-built pieces (step grid, per-track strip layout, Transport) should
  visually match the theming applied to the library's own components — reuse
  the same `--audioui-unit` sizing scale and theme colors in Linaria styles
  rather than introducing a separate visual system for the custom parts.
