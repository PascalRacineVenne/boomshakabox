import { useState } from "react";
import * as Tone from "tone";
import { distortionMakeupGain } from "../../lib/distortionMakeupGain";
import {
  masterBusInput,
  triggerMasterFilterEnvelope,
} from "../../lib/masterBus";
import { startAudioContext } from "../../lib/startAudioContext";

// Ported from a standalone FatKick.jsx recipe (Tone.MembraneSynth body +
// Tone.NoiseSynth click, its own compressor/limiter chain) into this
// project's per-hit ephemeral-node style — see useKickVoice.ts for the
// pattern this mirrors. Param names below (pitch/punch/length/click/
// fatness) are a 1:1 port of that file's own knob labels rather than this
// repo's usual tone/decay naming.

export const KICK2_PITCH_MIN = 34; // Hz
export const KICK2_PITCH_MAX = 72; // Hz
export const KICK2_PUNCH_MIN = 2; // octaves the pitch sweep starts above Pitch
export const KICK2_PUNCH_MAX = 9;
export const KICK2_LENGTH_MIN = 0.12; // seconds
export const KICK2_LENGTH_MAX = 0.7;
export const KICK2_CLICK_MIN = 0; // 0-1 mix
export const KICK2_CLICK_MAX = 1;
export const KICK2_FATNESS_MIN = 0; // 0-1, Tone.Distortion amount
export const KICK2_FATNESS_MAX = 1;

const PITCH_ENV_TIME = 0.035; // seconds — fixed, how long the pitch sweep takes to settle on Pitch (was MembraneSynth's pitchDecay)
const POST_DRIVE_LOWPASS = 9000; // Hz — fixed, smooths the Distortion stage's harmonics
const CLICK_FILTER_FREQ = 3200; // Hz — fixed bandpass center for the click layer
const CLICK_FILTER_Q = 0.7; // fixed
const CLICK_DURATION = 0.03; // seconds — short noise burst, bypasses Distortion entirely

/**
 * BD2's live knob state and its `trigger` function — a second, fatter kick
 * voice: sine VCO with a punch-scaled pitch sweep through a Distortion/
 * lowpass "fatness" stage, plus a separate band-passed noise click layer
 * that skips the Distortion so it stays crisp. Ported from a standalone
 * FatKick.jsx (Tone.MembraneSynth + Tone.NoiseSynth, its own private
 * compressor/limiter chain) into this project's create-play-dispose
 * ephemeral-node pattern, connecting into the shared `masterBusInput`
 * instead of a private master chain — see useKickVoice.ts.
 *
 * Not yet wired into `StepSequencer`/`TRACK_IDS` or given a pad UI — this
 * is just the sound engine for now, to dial in against the reference
 * before building the rest.
 *
 * @returns BD2's `pitch`/`punch`/`length`/`click`/`fatness`/`volume`/
 * `pan`/`muted`/`soloed`/`pressed` state, their setters, and `trigger`.
 */
export const useKick2Voice = () => {
  const [pitch, setPitch] = useState(48); // base frequency the pitch sweep settles on, in Hz
  const [punch, setPunch] = useState(5); // octaves above Pitch the sweep starts from
  const [length, setLength] = useState(0.32); // amp envelope decay length, in seconds
  const [click, setClick] = useState(0.4); // 0-1 mix level of the noise click layer
  const [fatness, setFatness] = useState(0.35); // 0-1, Tone.Distortion amount on the body
  const [volume, setVolume] = useState(75);
  const [pan, setPan] = useState(0);
  // Mute/solo — see useSnareVoice.ts for the full rationale: `muted` gates
  // `trigger`'s level without touching `volume` itself, `soloed` is
  // visual-only for now (cross-voice silencing isn't wired up).
  const [muted, setMuted] = useState(false);
  const [soloed, setSolo] = useState(false);
  const [pressed, setPressed] = useState(false);

  const trigger = async (scheduledTime?: number) => {
    if (scheduledTime === undefined) {
      await startAudioContext();
    }

    const now = scheduledTime ?? Tone.now();
    const duration = length;
    const level = muted ? 0 : volume / 100;

    triggerMasterFilterEnvelope(now);

    const panner = new Tone.Panner(pan / 100).connect(masterBusInput);

    // --- Body: sine VCO with a fast downward pitch sweep, saturated for thickness ---
    const startFreq = pitch * Math.pow(2, punch); // "Punch" knob: octaves above Pitch the sweep starts from
    const osc = new Tone.Oscillator(startFreq, "sine");
    osc.frequency.exponentialRampToValueAtTime(pitch, now + PITCH_ENV_TIME); // "Pitch" knob: where it settles

    const saturation = new Tone.Distortion(fatness); // "Fatness" knob
    saturation.oversample = "4x";

    const lowpass = new Tone.Filter(POST_DRIVE_LOWPASS, "lowpass");
    const makeupGain = new Tone.Gain(distortionMakeupGain(fatness));

    const ampGain = new Tone.Gain(1);
    ampGain.gain.setValueAtTime(level, now);
    ampGain.gain.exponentialRampToValueAtTime(0.001, now + duration); // "Length" knob

    osc.connect(saturation);
    saturation.connect(lowpass);
    lowpass.connect(makeupGain);
    makeupGain.connect(ampGain);
    ampGain.connect(panner);
    osc.start(now);
    osc.stop(now + duration);

    // --- Click: band-passed noise burst, kept out of the Distortion stage so it stays crisp ---
    const clickFilter = new Tone.Filter(CLICK_FILTER_FREQ, "bandpass");
    clickFilter.Q.value = CLICK_FILTER_Q;

    const clickGain = new Tone.Gain(1);
    clickGain.gain.setValueAtTime(click * 0.6 * level, now); // "Click" knob mix, scaled by Volume
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + CLICK_DURATION);

    const noise = new Tone.Noise("white").connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(panner);
    noise.start(now);
    noise.stop(now + CLICK_DURATION);

    setTimeout(
      () => {
        osc.dispose();
        saturation.dispose();
        lowpass.dispose();
        makeupGain.dispose();
        ampGain.dispose();
        noise.dispose();
        clickFilter.dispose();
        clickGain.dispose();
        panner.dispose();
      },
      (Math.max(duration, CLICK_DURATION) + 0.1) * 1000,
    );
  };

  return {
    pitch,
    setPitch,
    punch,
    setPunch,
    length,
    setLength,
    click,
    setClick,
    fatness,
    setFatness,
    volume,
    setVolume,
    pan,
    setPan,
    muted,
    setMuted,
    soloed,
    setSolo,
    pressed,
    setPressed,
    trigger,
  };
};
