import { useState } from "react";
import * as Tone from "tone";
import {
  masterBusInput,
  triggerMasterFilterEnvelope,
} from "../../lib/masterBus";
import { startAudioContext } from "../../lib/startAudioContext";

// Ported from a reference recipe (src/KickSauceMembrane.tsx) that used
// Tone.MembraneSynth + Tone.NoiseSynth directly instead of hand-built
// oscillator/envelope nodes — an earlier attempt at this same sound from
// raw primitives didn't nail it, since MembraneSynth's own internal
// pitch-envelope curve is part of what makes this recipe sound right.
// Built fresh per hit and disposed afterward, same ephemeral-node
// lifecycle every other useXVoice hook uses — a fresh MembraneSynth/
// NoiseSynth sounds identical to a reused one, since its envelope/pitch-
// sweep always resets from `now` on `triggerAttackRelease` regardless of
// whether the instance is new or recycled.

export const KICK_PITCH_MIN = 34; // Hz
export const KICK_PITCH_MAX = 72; // Hz
export const KICK_PUNCH_MIN = 2; // octaves the pitch envelope starts above Pitch
export const KICK_PUNCH_MAX = 9;
export const KICK_LENGTH_MIN = 0.12; // seconds
export const KICK_LENGTH_MAX = 0.7;
export const KICK_CLICK_MIN = 0; // 0-1 mix
export const KICK_CLICK_MAX = 1;
export const KICK_FATNESS_MIN = 0; // 0-1, Tone.Distortion amount
export const KICK_FATNESS_MAX = 1;

const PITCH_DECAY = 0.035; // seconds — fixed, MembraneSynth's own pitch-envelope time
const RELEASE_TAIL = 0.05; // seconds — added to Length when triggering, matches the reference's `decay + 0.05`
const ENVELOPE_RELEASE = 0.05; // seconds — MembraneSynth's own envelope.release
const CLICK_TRIGGER_DURATION = 0.02; // seconds — passed to the click NoiseSynth's triggerAttackRelease

// The reference recipe's Limiter connects straight to `.toDestination()` —
// its -1dB peak IS the final output level. Ours instead continues through
// two more gain stages the reference never had to survive: this voice's
// own Volume slider and the shared master bus's Volume knob (`masterGain`
// in lib/masterBus.ts), both defaulting to 75%. Left uncompensated, that's
// an extra ~-5dB (0.75 x 0.75) versus the reference at matching knob
// positions. This fixed makeup gain cancels exactly that, so at each
// hook's own default (75%/75%) this voice's peak matches the reference's;
// turning either Volume knob up or down from there still scales it
// normally, same as any other voice.
const OUTPUT_MAKEUP_GAIN = 1 / (0.75 * 0.75); // ~1.78x, +5dB

const DEFAULTS_KICK = {
  pitch: 48,
  punch: 5,
  decay: 0.32,
  click: 0.4,
  drive: 0,
};

/**
 * The kick's live knob state and its `trigger` function — a
 * `Tone.MembraneSynth`/`Tone.NoiseSynth` recipe built fresh on every hit,
 * faithfully porting a reference recipe's own master chain (Distortion ->
 * lowpass -> makeup gain -> highpass -> Compressor -> Limiter) rather than
 * trimming it down, since fidelity to that exact sound is the point. The
 * Limiter's output then feeds this app's usual Volume/Pan stage and shared
 * `masterBusInput`, so Master Drive/Filter and the master filter envelope
 * still reach it like every other voice.
 *
 * `trigger` accepts an optional `scheduledTime`: called with none (a
 * manual pad press), it unlocks the audio context via
 * {@link startAudioContext} (which also absorbs the first-ever-sound
 * warm-up glitch on a throwaway tone, see that function) and fires at
 * `Tone.now()`. Called with a time (from the sequencer's
 * `Tone.Transport.scheduleRepeat` callback), it skips that gate entirely —
 * the Transport can only be running after Start already passed it once —
 * and schedules everything at the precise time the look-ahead scheduler
 * asked for, rather than at "now."
 *
 * @returns The kick's `pitch`/`punch`/`length`/`click`/`fatness`/
 * `volume`/`pan`/`muted`/`soloed`/`pressed` state, their setters, and
 * `trigger`.
 */
export const useKickVoice = () => {
  const [pitch, setPitch] = useState(DEFAULTS_KICK.pitch); // note frequency passed at trigger time, in Hz
  const [punch, setPunch] = useState(DEFAULTS_KICK.punch); // MembraneSynth octaves — how many octaves above Pitch the sweep starts
  const [length, setLength] = useState(DEFAULTS_KICK.decay); // MembraneSynth envelope.decay, in seconds
  const [click, setClick] = useState(DEFAULTS_KICK.click); // 0-1 mix level of the noise click layer
  const [fatness, setFatness] = useState(DEFAULTS_KICK.drive); // 0-1, Tone.Distortion amount on the body
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
    const duration = length + RELEASE_TAIL; // "Length" knob
    const level = muted ? 0 : volume / 100;

    triggerMasterFilterEnvelope(now);

    const panner = new Tone.Panner(pan / 100).connect(masterBusInput);
    const volumeGain = new Tone.Gain(level).connect(panner);
    const outputMakeup = new Tone.Gain(OUTPUT_MAKEUP_GAIN).connect(volumeGain);

    // Reference recipe's own master chain, preserved in full rather than
    // trimmed down to this app's shared masterBus — that chain is what
    // gives this recipe its exact character.
    const limiter = new Tone.Limiter(-1).connect(outputMakeup);
    const compressor = new Tone.Compressor({
      threshold: -16,
      ratio: 4,
      attack: 0.003,
      release: 0.12,
    }).connect(limiter);
    const highpass = new Tone.Filter(28, "highpass").connect(compressor);
    const makeupGain = new Tone.Gain(2.4).connect(highpass);
    const lowpass = new Tone.Filter(9000, "lowpass").connect(makeupGain);

    const dist = new Tone.Distortion({
      distortion: fatness, // "Fatness" knob
      oversample: "4x",
    }).connect(lowpass);
    const kick = new Tone.MembraneSynth({
      pitchDecay: PITCH_DECAY,
      octaves: punch, // "Punch" knob
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.001,
        decay: length,
        sustain: 0,
        release: ENVELOPE_RELEASE,
      },
    }).connect(dist);

    const clickFilter = new Tone.Filter(3200, "bandpass");
    clickFilter.Q.value = 0.7;
    const clickGain = new Tone.Gain(click * 0.6); // "Click" knob mix
    const clickSynth = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.0005, decay: 0.012, sustain: 0 },
    });
    clickSynth.chain(clickFilter, clickGain, compressor);

    kick.triggerAttackRelease(pitch, duration, now); // "Pitch" knob
    clickSynth.triggerAttackRelease(CLICK_TRIGGER_DURATION, now);

    setTimeout(
      () => {
        kick.dispose();
        clickSynth.dispose();
        clickFilter.dispose();
        clickGain.dispose();
        dist.dispose();
        lowpass.dispose();
        makeupGain.dispose();
        highpass.dispose();
        compressor.dispose();
        limiter.dispose();
        outputMakeup.dispose();
        volumeGain.dispose();
        panner.dispose();
      },
      (duration + ENVELOPE_RELEASE + 0.1) * 1000,
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
