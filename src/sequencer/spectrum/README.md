# Spectrum

Real-time frequency-spectrum display for the whole kit, mounted once as
`MasterSpectrum` (`MasterSpectrum.tsx`) inside `StepSequencer`, next to the
per-voice oscilloscope and `MiniGrid`.

## How it taps its audio source

Unlike the oscilloscope (per-voice), this taps the **master bus**: a single
shared `Tone.Analyser("fft", 2048)` (`masterSpectrumAnalyser` in
`lib/masterSpectrum.ts`) is connected once to `masterLimiter` — the actual
final node before `toDestination()`, not the pre-effects `masterBusInput` —
so it reflects what's actually reaching the speakers (post-filter,
post-effects, post-delay/reverb, post-compression), not the dry per-voice
signal. The tap is a pure fan-out; it doesn't alter or insert itself into
the signal path.

## Render loop shape

`requestAnimationFrame` loop → `useMasterSpectrum`'s `getSpectrum()` →
process → draw:

1. **`useMasterSpectrum.ts`** downsamples the raw 2048-bin FFT to 72
   log-spaced columns spanning 20Hz–20kHz (`SPECTRUM_COLUMN_COUNT`,
   `columnFrequency`), each column averaging its window of linear FFT bins
   — narrow windows at the low end (where columns are close together in
   frequency), wide windows at the high end (where many linear bins fall
   within one log-spaced column).
2. **Peak-hold with decay**: each column tracks its own held value, rising
   instantly to a new peak but falling back only at a fixed dB-per-frame
   rate (`PEAK_DECAY_DB_PER_FRAME`) when the signal drops — this is what
   gives the display its "settling" look rather than jittering frame to
   frame.
3. **`MasterSpectrum.tsx`** draws axis gridlines/labels (a hardcoded
   20Hz–20kHz tick set, since auto-generated "nice" log ticks don't land on
   the values audio tools conventionally use), then the spectrum curve
   itself as a stroked line with a low-opacity fill underneath — the same
   visual language as the oscilloscope's waveform views.

## Notes

- **The dB range (-100 to -30)** is the native Web Audio `AnalyserNode`'s
  own documented default (`minDecibels`/`maxDecibels`) — `Tone.Analyser`
  doesn't override these, so this is the real range
  `getFloatFrequencyData()` can return, not an empirically-tuned guess.
- **Canvas sizing needs care here in a way the oscilloscope doesn't**: this
  canvas's width/height attributes double as both its rendering-resolution
  (backing store) and its default CSS size, so resizing it for
  `devicePixelRatio` can feed back into whatever flex/grid layout is sizing
  its container. The fix: the actual `<canvas>` is `position: absolute;
  inset: 0` inside a plain, non-intrinsic-size wrapper `<div>` — fully
  removed from normal layout flow so its own size can never influence the
  wrapper — and a `ResizeObserver` watches that **wrapper**, never the
  canvas itself, to decide the canvas's backing-store resolution each
  resize.
- **Row layout is CSS Grid, not flexbox** (`.scopeRow` in
  `StepSequencer.tsx`), specifically so this component's column gets an
  explicit `minmax(SPECTRUM_CANVAS_WIDTH, 1fr)` track — never smaller than
  one scope canvas's width, but absorbing any leftover row space — rather
  than negotiating that through flex-grow/shrink.
