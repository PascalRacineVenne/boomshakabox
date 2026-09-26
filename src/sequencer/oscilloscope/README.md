# Oscilloscope

Per-voice waveform display, mounted once per selected track as `VoiceScope`
(`VoiceScope.tsx`) inside `StepSequencer`. Shows two views side by side for
whichever voice is currently selected:

- **`WaveformDisplay.tsx`** — a live, scrolling scope reading directly off
  that voice's own `Tone.Waveform` node (`waveformRef`, created by
  `useScopeWaveform` in `lib/voiceScope.ts` and tapped in parallel off that
  voice's panner — see any voice's own README for exactly where the tap sits
  in its chain).
- **`FullWaveformDisplay.tsx`** — a static rendering of the voice's *entire*
  envelope shape (attack through full decay), not just whatever's in the
  live analyser's current window. Recomputed via `renderOfflineWaveform`
  (also in `lib/voiceScope.ts`), which renders the voice's own
  `buildAndTrigger*` function through `Tone.Offline` and averages the
  stereo output down to mono. Debounced 200ms after any knob change, so
  dragging a knob doesn't trigger an offline render on every tick.

Both share sizing/styling constants and a canvas render helper from
`scopeCanvas.ts`.

## How each taps its audio source

- **Live view**: per-voice, not master — each voice's `trigger()` connects
  its panner to a `waveform` node passed in from `useScopeWaveform`, a
  parallel fan-out tap that doesn't affect the audible signal path.
- **Full view**: not a live tap at all — a fresh, silent, non-realtime
  render of that voice's own trigger function through `Tone.Offline`,
  computed on demand rather than sampled from the live signal.

## Render loop shape

- **`WaveformDisplay`**: `requestAnimationFrame` loop → read
  `waveformRef.current.getValue()` → clear canvas → draw a point-to-point
  line across the buffer.
- **`FullWaveformDisplay`**: no animation loop — draws once whenever `data`
  (the offline-rendered `Float32Array`) changes, using a min/max-per-pixel-
  column technique (each canvas column reduces its slice of the buffer to a
  vertical min/max line) so the whole envelope fits in a fixed-width canvas
  regardless of its actual sample length.

## Notes

- **`scopeCanvasClass`'s stroke color** is resolved once up front via
  `getComputedStyle(canvas).getPropertyValue("--contrast-1")` rather than
  passed straight into `strokeStyle` as a CSS variable reference — canvas
  doesn't reliably resolve CSS custom properties across engines when handed
  directly to drawing APIs.
- **Canvas width/height are fixed constants** (`SCOPE_CANVAS_WIDTH` /
  `SCOPE_CANVAS_HEIGHT`), not computed from layout — unlike the spectrum
  display (see [`../spectrum/README.md`](../spectrum/README.md)), this
  canvas doesn't need to track a dynamically-stretched container size, so it
  doesn't need that display's wrapper/ResizeObserver/devicePixelRatio
  handling.
