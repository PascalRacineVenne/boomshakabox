import * as Tone from "tone";

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

const masterFilter = new Tone.Filter(2000, "lowpass");
masterDistortion.connect(masterFilter);

const masterGain = new Tone.Gain(0.75).toDestination();
masterFilter.connect(masterGain);

/** Where every voice's final node should `.connect()` into. */
export const masterBusInput = masterDistortion;

export { masterDistortion, masterFilter, masterGain };

// ---- Master filter envelope + keyboard tracking ----
//
// "Env Amount" and "Keyboard Tracking" both modulate `masterFilter.frequency`
// on every drum hit, on top of whatever the Cutoff knob itself holds. Rather
// than compute a combined target Hz value and repeatedly overwrite
// `frequency` (which would fight the Cutoff knob's own `.rampTo` scheduling
// whenever both are live at once), both paths are separate `Tone.Gain`
// "depth" scalers fed by one shared `Tone.Envelope` shape and connected
// directly into `masterFilter.frequency` — an AudioParam sums every
// audio-rate connection into it with its own held/scheduled value for free,
// which is the idiomatic Web Audio way to layer modulation onto a live
// knob-controlled parameter without the two ever competing over the same
// scheduled value.

const FILTER_ENV_DECAY = 0.15; // seconds — how long each hit's sweep takes to settle back
const ENV_DEPTH_HZ = 4000; // how far a full +/-1 "Env Amount" sweeps the cutoff, in Hz
const TRACKING_DEPTH_HZ = 3000; // how far full "Keyboard Tracking" shifts cutoff at the extremes of a voice's own Tone knob, in Hz

const filterEnvelope = new Tone.Envelope({
  attack: 0.001,
  decay: FILTER_ENV_DECAY,
  sustain: 0, // decays fully back to baseline on its own — no separate release needed
  release: 0.01,
});

// Fixed depth: re-set only when the Env Amount knob turns. Signed, so a
// negative amount sweeps the cutoff down instead of up.
const envDepthGain = new Tone.Gain(0);
filterEnvelope.connect(envDepthGain);
envDepthGain.connect(masterFilter.frequency);

// Per-hit depth: re-set right before each trigger, scaled by that voice's
// own normalized Tone-knob position — this app's stand-in for "note pitch"
// since it's a drum machine, not a keyboard instrument.
const trackingDepthGain = new Tone.Gain(0);
filterEnvelope.connect(trackingDepthGain);
trackingDepthGain.connect(masterFilter.frequency);

let keyboardTrackingAmount = 0; // 0-1, read at trigger time to scale trackingDepthGain per hit

export const setMasterFilterEnvAmount = (amount: number) => {
  envDepthGain.gain.value = amount * ENV_DEPTH_HZ;
};

export const setMasterFilterKeyboardTracking = (amount: number) => {
  keyboardTrackingAmount = amount;
};

/**
 * Fires the master filter's shared envelope shape — called by every drum
 * voice's own `trigger()` alongside its own amp envelope, so any hit
 * sweeps the master filter. `normalizedPitch` (0-1) is that voice's own
 * Tone knob position within its own range.
 */
export const triggerMasterFilterEnvelope = (time: number, normalizedPitch: number) => {
  trackingDepthGain.gain.setValueAtTime(keyboardTrackingAmount * TRACKING_DEPTH_HZ * normalizedPitch, time);
  filterEnvelope.triggerAttack(time);
};
