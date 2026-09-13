# Drum Machine — UI Stack Spec (Vite + Tailwind v4 + shadcn/ui + audio/ui)

## Relationship to the architecture doc

This file covers **UI stack and component choices only**. Audio scheduling,
state-layer split (pattern/live-params/display), and the live-knob-update
pattern live in `drum-machine-architecture.md` — that logic does not change
based on which UI library draws the knobs, and should not be duplicated here.

**The one bridging rule between the two docs:**
Every `Knob`/`Fader` component's `onChange` handler must call into the same
three-step write described in the architecture doc — (1) write to
`liveParamsRef`, (2) write directly to the live Tone node, (3) update
component/display state for the visual only. `audio/ui` components must
never own the audio-relevant value in local component state; they are visual
controllers over refs that live outside React's render cycle.

## Stack

- **Build tool**: Vite (not Next.js — not required for this stack)
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4, utility classes written directly in JSX
  `className` props. Dynamic/continuously-variable values (knob rotation
  angle, fader handle position, playhead highlight) use inline `style={}`
  since Tailwind classes are static and can't be generated per runtime value.
- **Component base**: shadcn/ui (CLI-driven, copies source into the repo —
  no black-boxed npm dependency)
- **Audio UI components**: `audio/ui` (audio-ui.xyz), installed via shadcn
  registry on top of shadcn/ui. Also copied source, not an npm import — no
  long-term dependency/version-rot risk.

## Setup order

1. Scaffold Vite + React + TS project
2. Install and configure Tailwind CSS v4
3. Initialize shadcn/ui (`npx shadcn@latest init`)
4. Add the `audio/ui` registry to `components.json`:

```json
{
  "registries": {
    "@audio": "https://audio-ui.xyz/r/{style}/{name}.json"
  }
}
```

5. Install individual `audio/ui` components via shadcn CLI as needed (Knob,
   Fader, Transport) — each pulls actual component source into the repo for
   direct editing.

## v1 component mapping

| Feature                                    | Component                                         | Notes                                                                                                                                                                             |
| ------------------------------------------ | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Master volume                              | `Fader`                                           | Direct fit                                                                                                                                                                        |
| Transport (Play/Stop)                      | `Transport`                                       | Direct fit                                                                                                                                                                        |
| Master filter cutoff                       | `Knob`                                            | Generic Knob wired to master filter node                                                                                                                                          |
| Master resonance                           | `Knob`                                            | Generic Knob, same filter node                                                                                                                                                    |
| Master distortion                          | `Knob`                                            | Generic Knob wired to distortion node (+ optional toggle)                                                                                                                         |
| Master reverb send                         | `Knob` or `Fader`                                 | UI control only — actual reverb DSP is `Tone.Reverb`                                                                                                                              |
| Master delay send                          | `Knob`                                            | UI control only — actual delay DSP is `Tone.FeedbackDelay` or similar                                                                                                             |
| Per-track strip ×6                         | **Custom-built** from `Fader` + `Knob` primitives | No bundled "Channel Strip" used — built manually per track for full control over layout/composition. See per-instrument breakdown below — strips are not identical across tracks. |
| Step sequencer grid (≤64 steps × 6 tracks) | **Custom-built**                                  | Not covered by audio/ui at all — grid of toggleable step buttons, styled directly with Tailwind                                                                                   |

## Per-track strip — shared base + instrument-specific controls

Every strip shares the same base controls, then adds 1–2 instrument-specific
knobs on top. The strip is **not** a fixed-prop component — it should be
driven by a per-track config so the extra knob(s) render conditionally per
instrument, rather than every track carrying unused slots.

**Shared base (all 6 tracks):** Volume (`Fader`), Pan (`Knob`), Delay send
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

- `audio/ui` components are Tailwind-styled by default; once copied into the
  repo, styling is edited directly in the component file (no theme-prop
  override pattern like AntD — you edit the JSX/classes directly).
- Because both shadcn/ui and `audio/ui` copy source rather than install a
  package, there is no ongoing dependency to patch/audit for these specific
  components — reduces the "unmaintained package" risk raised when choosing
  the stack.
- Custom-built pieces (step grid, per-track strip) should follow the same
  Tailwind utility-class convention as the copied audio/ui components for
  visual consistency, rather than introducing a separate styling approach.
