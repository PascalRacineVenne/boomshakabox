import * as Tone from "tone";

/**
 * A second insert chain on the master bus (see `masterBus.ts`), generic by
 * design — not tied to any one effect the way the name might suggest at a
 * glance. It currently holds a Moog-ladder-style Drive + Filter + dynamics
 * chain (below), but that's just what's in it today; reverb, delay, or
 * anything else that belongs on a shared insert rather than inside one
 * voice's own recipe can land here too, without another rename.
 *
 * Today's chain — Drive (Tone.Distortion) -> Filter (Tone.Filter, rolloff:
 * -24) -> Compressor -> Limiter — is a stock-Tone.js approximation of the
 * 4-pole/24dB-per-octave resonant lowpass behind the Minimoog and friends,
 * rather than a faithful nonlinear-feedback model of the real
 * transistor-ladder circuit — that would need the saturation curve living
 * *inside* a per-sample feedback loop, which Web Audio's node graph can't
 * express without a custom `AudioWorkletNode` (a bigger lift, and this
 * project's first worklet). This is the cheaper tier instead.
 *
 * `rolloff: -24` gets the right 4-pole slope for free — Tone.Filter
 * implements it by internally cascading biquads, so this is one node
 * instead of hand-chaining four. The Distortion stage ahead of it stands
 * in for the real ladder's transistor-stage saturation (the "warmth" a
 * clean linear 4-pole filter doesn't have), and pushing Resonance (the
 * filter's Q) high gets a strong resonant peak approaching (but not truly
 * reaching) self-oscillation — Q-driven ringing on a linear filter reads
 * close to that character without the real feedback-loop nonlinearity.
 *
 * That last part cuts both ways, though: the real ladder's resonance boost
 * is naturally self-limiting, because the same transistor saturation that
 * gives it its tone also caps how loud the resonant peak can get before it
 * just compresses into the self-oscillating sine tone. This filter has no
 * such ceiling — it's a clean linear biquad cascade, so a high Q boosts
 * gain at the cutoff frequency essentially unchecked, and can get loud
 * enough to slam into the master bus's later stages. A Compressor +
 * Limiter after the filter stands in for that missing self-limiting
 * behavior — same "tame a hot/nonlinear signal" role the Compressor +
 * Limiter pairing already plays in `useKickVoice.ts`'s own chain.
 *
 * Created once and kept alive for the app's lifetime, same node-lifecycle
 * rule as `masterBus.ts`. Wired into the live master bus in that file
 * (`masterFilter.connect(effectsBusInput)` ... `effectsBusOutput.connect(masterGain)`)
 * — sits after the original sweepable filter, before the final Volume
 * stage. Controlled via `useEffectsBus.ts`/`EffectsPanel.tsx`.
 */

// Cranking `distortion` doesn't just crush peaks — the curve gets harder
// (more square-wave-like), which packs in more harmonic energy and reads
// as louder even though peak amplitude is still bounded. The Compressor/
// Limiter below catch that after the fact, but only so well; this input
// trim compensates proactively, ramped down as Drive increases (see
// `useEffectsBus.ts`'s `setDrive`), so Drive adds character without also
// quietly doubling as a volume knob.
const effectsDriveTrim = new Tone.Gain(1);
const effectsDrive = new Tone.Distortion(0);
effectsDriveTrim.connect(effectsDrive);
const effectsFilter = new Tone.Filter({
  type: "lowpass",
  frequency: 12000,
  Q: 0.5,
  rolloff: -24,
});
effectsDrive.connect(effectsFilter);

// Tames the otherwise-unchecked resonance boost — see the doc comment
// above. Fast attack so it catches a resonant spike before it slams the
// next stage, quick release so it doesn't audibly pump/duck across a
// pattern; the Limiter is the hard final ceiling. This chain runs on
// EVERY voice (not an optional insert), so both stay light — -1dB is a
// rare-overs safety net, not a workhorse squashing the whole mix by
// default; the actual taming of a hot Drive setting happens upstream, in
// the input trim (see useEffectsBus.ts's setDrive).
const effectsCompressor = new Tone.Compressor({
  threshold: -12,
  ratio: 4,
  attack: 0.003,
  release: 0.1,
});
const effectsLimiter = new Tone.Limiter(-1);
effectsFilter.connect(effectsCompressor);
effectsCompressor.connect(effectsLimiter);

/** Where the master bus connects into (see `masterBus.ts`). */
export const effectsBusInput = effectsDriveTrim;

/** Where the master bus continues on from, downstream of this chain's last stage. */
export const effectsBusOutput = effectsLimiter;

export {
  effectsDriveTrim,
  effectsDrive,
  effectsFilter,
  effectsCompressor,
  effectsLimiter,
};
