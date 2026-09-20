import * as Tone from "tone";

/**
 * The master filter's selectable modes, keyed by name so call sites read as
 * `MODE_OPTIONS.LOWPASS` instead of a bare `"lowpass"` string repeated
 * across the audio engine (`masterFilter.type`) and the UI (`FilterPanel`'s
 * cycle button + `useFilterBus`'s default) — one place to add a mode (e.g.
 * "notch") instead of three.
 */
export const FILTER_MODE_OPTIONS = {
  LOWPASS: { value: "lowpass", label: "LP" },
  BANDPASS: { value: "bandpass", label: "BP" },
  HIGHPASS: { value: "highpass", label: "HP" },
} as const;

export type FilterMode =
  (typeof FILTER_MODE_OPTIONS)[keyof typeof FILTER_MODE_OPTIONS]["value"];

/**
 * The single master output chain every drum voice's final VCA connects
 * into (`.connect(masterBusInput)`) instead of calling `.toDestination()`
 * directly: Drive -> Filter -> Volume -> Destination, the way a drum
 * machine's mixer has one overdrive, one sweepable filter, and one master
 * fader after all the individual channel strips.
 *
 * Created once at module load and kept alive for the whole session (this
 * project's node-lifecycle rule, ARCHITECTURE-SPEC.MD). There's exactly
 * one master bus for the whole app, the same way there's exactly one
 * `Tone.getDestination()` — so this is a plain module-level singleton
 * rather than a node created inside a React effect and threaded through
 * props/context to reach all four (and future) voice hooks.
 *
 * The metronome click (`useMetronomeClick.ts`) deliberately does NOT run
 * through this bus — it's a reference/practice tone, not part of the mix,
 * so master volume/drive/filter shouldn't affect it.
 *
 * Drive on/off is implemented via the effect's own `.wet` signal (0 =
 * fully dry/bypassed, 1 = fully wet) rather than physically
 * connecting/disconnecting nodes — keeps the audio graph static, per the
 * architecture rule against rewiring nodes at runtime.
 */
const masterDistortion = new Tone.Distortion(0.4);
masterDistortion.wet.value = 0; // off by default

// rolloff: -24dB/octave (Tone.Filter's default is -12) — a steeper cut for
// a more pronounced sweep as Cutoff closes in on a sound's fundamentals.
const masterFilter = new Tone.Filter(12000, FILTER_MODE_OPTIONS.LOWPASS.value);
masterDistortion.connect(masterFilter);

const masterGain = new Tone.Gain(0.75).toDestination();
masterFilter.connect(masterGain);

/** Where every voice's final node should `.connect()` into. */
export const masterBusInput = masterDistortion;

export { masterDistortion, masterFilter, masterGain };

// ---- Master filter envelope ----
//
// "Env Amount" modulates `masterFilter.frequency` on every drum hit, on top
// of whatever the Cutoff knob itself holds. Rather than compute a combined
// target Hz value and repeatedly overwrite `frequency` (which would fight
// the Cutoff knob's own `.rampTo` scheduling whenever both are live at
// once), it's a `Tone.Gain` "depth" scaler fed by a `Tone.Envelope` and
// connected directly into `masterFilter.frequency` — an AudioParam sums
// every audio-rate connection into it with its own held/scheduled value for
// free, which is the idiomatic Web Audio way to layer modulation onto a
// live knob-controlled parameter without the two ever competing over the
// same scheduled value.
//
// (There was also a "Keyboard Tracking" knob here, scaling a second per-hit
// offset by each voice's own Tone-knob position. Removed: with no per-step
// pitch or velocity input, it could only ever apply the same fixed offset
// on every hit — mathematically identical to just setting a different base
// Cutoff. Not a distinct behavior, so not a real control.)

const FILTER_ENV_DECAY = 0.15; // seconds — how long each hit's sweep takes to settle back
const ENV_DEPTH_HZ = 4000; // how far a full +/-1 "Env Amount" sweeps the cutoff, in Hz

const filterEnvelope = new Tone.Envelope({
  attack: 0.001,
  decay: FILTER_ENV_DECAY,
  sustain: 0, // decays fully back to baseline on its own — no separate release needed
  release: 0.01,
});

// Signed, so a negative amount sweeps the cutoff down instead of up.
const envDepthGain = new Tone.Gain(0);
filterEnvelope.connect(envDepthGain);
envDepthGain.connect(masterFilter.frequency);

export const setMasterFilterEnvAmount = (amount: number) => {
  envDepthGain.gain.value = amount * ENV_DEPTH_HZ;
};

// The step sequencer calls `trigger()` on every track scheduled for the
// current step from one `Tone.Transport.scheduleRepeat` callback, all with
// the exact same `time` (see `useStepSequencer.ts`) — so a busy step with
// several tracks hitting at once would otherwise retrigger this SAME
// envelope several times at that identical instant, each restarting the
// ramp mid-sweep and clicking. Deduping by exact `time` match collapses
// that back down to one sweep per step, matching what's audible anyway
// (one shared master filter, not one per voice).
let lastEnvelopeTriggerTime = -1;

/**
 * Fires the master filter's shared envelope shape — called by every drum
 * voice's own `trigger()` alongside its own amp envelope, so any hit
 * sweeps the master filter.
 */
export const triggerMasterFilterEnvelope = (time: number) => {
  if (time === lastEnvelopeTriggerTime) return;
  lastEnvelopeTriggerTime = time;
  filterEnvelope.triggerAttack(time);
};
