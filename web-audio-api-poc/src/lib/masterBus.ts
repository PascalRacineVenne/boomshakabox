import * as Tone from "tone";

/**
 * The single master output chain every drum voice's final VCA connects
 * into (`.connect(masterBusInput)`) instead of calling `.toDestination()`
 * directly — one bypassable `Tone.Distortion` (master "Drive") feeding one
 * `Tone.Gain` (master "Volume"), the way a drum machine's mixer has one
 * overdrive + one master fader after all the individual channel strips.
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
 * so master volume/drive shouldn't affect it.
 *
 * Drive on/off is implemented via the effect's own `.wet` signal (0 =
 * fully dry/bypassed, 1 = fully wet) rather than physically
 * connecting/disconnecting nodes — keeps the audio graph static, per the
 * architecture rule against rewiring nodes at runtime.
 */
const masterDistortion = new Tone.Distortion(0.4);
masterDistortion.wet.value = 0; // off by default

const masterGain = new Tone.Gain(0.75).toDestination();
masterDistortion.connect(masterGain);

/** Where every voice's final node should `.connect()` into. */
export const masterBusInput = masterDistortion;

export { masterDistortion, masterGain };
