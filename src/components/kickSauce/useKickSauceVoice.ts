import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import {
  masterBusInput,
  triggerMasterFilterEnvelope,
} from "../../lib/masterBus";
import { startAudioContext } from "../../lib/startAudioContext";

// Ported from a reference recipe (src/KickSauceMembrane.tsx) that used
// Tone.MembraneSynth + Tone.NoiseSynth directly instead of hand-built
// oscillator/envelope nodes (compare useKick2Voice.ts, which tried to
// recreate the same sound from raw primitives and didn't nail it —
// MembraneSynth's own internal pitch-envelope curve is part of what makes
// this recipe sound right). Kept as a persistent instrument + effects
// chain for the component's lifetime, same lifecycle useADSR.ts uses for
// its envelope, rather than this project's usual per-hit ephemeral nodes —
// Tone's Synth-family instruments are designed to be retriggered, not
// rebuilt every hit.

export const KICKSAUCE_PITCH_MIN = 34; // Hz
export const KICKSAUCE_PITCH_MAX = 72; // Hz
export const KICKSAUCE_PUNCH_MIN = 2; // octaves the pitch envelope starts above Pitch
export const KICKSAUCE_PUNCH_MAX = 9;
export const KICKSAUCE_LENGTH_MIN = 0.12; // seconds
export const KICKSAUCE_LENGTH_MAX = 0.7;
export const KICKSAUCE_CLICK_MIN = 0; // 0-1 mix
export const KICKSAUCE_CLICK_MAX = 1;
export const KICKSAUCE_FATNESS_MIN = 0; // 0-1, Tone.Distortion amount
export const KICKSAUCE_FATNESS_MAX = 1;

const PITCH_DECAY = 0.035; // seconds — fixed, MembraneSynth's own pitch-envelope time
const RELEASE_TAIL = 0.05; // seconds — added to Length when triggering, matches the reference's `decay + 0.05`
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

interface KickSauceNodes {
  kick: Tone.MembraneSynth;
  click: Tone.NoiseSynth;
  clickFilter: Tone.Filter;
  clickGain: Tone.Gain;
  dist: Tone.Distortion;
  lowpass: Tone.Filter;
  makeupGain: Tone.Gain;
  highpass: Tone.Filter;
  compressor: Tone.Compressor;
  limiter: Tone.Limiter;
  volumeGain: Tone.Gain;
  panner: Tone.Panner;
}

/**
 * BD3/"KickSauce" — a persistent `Tone.MembraneSynth`/`Tone.NoiseSynth`
 * signal chain, faithfully porting the reference recipe's own master chain
 * (Distortion -> lowpass -> makeup gain -> highpass -> Compressor ->
 * Limiter) rather than trimming it down, since fidelity to that exact
 * sound is the point. The Limiter's output then feeds this app's usual
 * Volume/Pan stage and shared `masterBusInput`, so Master Drive/Filter and
 * the master filter envelope still reach it like every other voice.
 *
 * Built and disposed in a mount-only effect (not the render body) so
 * StrictMode's dev-only mount→cleanup→mount replay recreates the chain
 * correctly — see useADSR.ts for the same pattern and rationale. `Punch`/
 * `Length`/`Fatness`/`Click`/`Volume`/`Pan` are "sustained" params (per
 * ARCHITECTURE-SPEC.MD): their setters write straight to the live nodes,
 * same as useFilterBus.ts. `Pitch` has no persistent node property to
 * write to — MembraneSynth only takes it as `triggerAttackRelease`'s note
 * argument — so it's read fresh from state at trigger time.
 *
 * @returns KickSauce's `pitch`/`punch`/`length`/`click`/`fatness`/
 * `volume`/`pan`/`muted`/`soloed`/`pressed` state, their setters, and
 * `trigger`.
 */
export const useKickSauceVoice = () => {
  const [pitch, setPitch] = useState(48); // note frequency passed at trigger time, in Hz
  const [punch, setPunchState] = useState(5); // MembraneSynth octaves — how many octaves above Pitch the sweep starts
  const [length, setLengthState] = useState(0.32); // MembraneSynth envelope.decay, in seconds
  const [click, setClickState] = useState(0.4); // 0-1 mix level of the noise click layer
  const [fatness, setFatnessState] = useState(0.35); // 0-1, Tone.Distortion amount on the body
  const [volume, setVolumeState] = useState(75);
  const [pan, setPanState] = useState(0);
  // Mute/solo — see useSnareVoice.ts for the full rationale: `muted` gates
  // the live volumeGain node without touching `volume` itself, `soloed` is
  // visual-only for now (cross-voice silencing isn't wired up).
  const [muted, setMutedState] = useState(false);
  const [soloed, setSolo] = useState(false);
  const [pressed, setPressed] = useState(false);

  const nodesRef = useRef<KickSauceNodes | null>(null);

  useEffect(() => {
    const panner = new Tone.Panner(pan / 100).connect(masterBusInput);
    const volumeGain = new Tone.Gain(muted ? 0 : volume / 100).connect(
      panner,
    );

    const outputMakeup = new Tone.Gain(OUTPUT_MAKEUP_GAIN).connect(
      volumeGain,
    );

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
      distortion: fatness,
      oversample: "4x",
    }).connect(lowpass);
    const kick = new Tone.MembraneSynth({
      pitchDecay: PITCH_DECAY,
      octaves: punch,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: length, sustain: 0, release: 0.05 },
    }).connect(dist);

    const clickFilter = new Tone.Filter(3200, "bandpass");
    clickFilter.Q.value = 0.7;
    const clickGain = new Tone.Gain(click * 0.6);
    const clickSynth = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.0005, decay: 0.012, sustain: 0 },
    });
    clickSynth.chain(clickFilter, clickGain, compressor);

    nodesRef.current = {
      kick,
      click: clickSynth,
      clickFilter,
      clickGain,
      dist,
      lowpass,
      makeupGain,
      highpass,
      compressor,
      limiter,
      volumeGain,
      panner,
    };

    return () => {
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
      nodesRef.current = null;
    };
    // Deliberately mount-only: every value read above seeds the chain's
    // initial state once, the same "seed it once" intent useADSR.ts's own
    // mount-only effect relies on. Live changes after mount go through the
    // setters below instead of re-running this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPunch = useCallback((value: number) => {
    setPunchState(value);
    if (nodesRef.current) nodesRef.current.kick.octaves = value;
  }, []);

  const setLength = useCallback((value: number) => {
    setLengthState(value);
    if (nodesRef.current) nodesRef.current.kick.envelope.decay = value;
  }, []);

  const setClick = useCallback((value: number) => {
    setClickState(value);
    nodesRef.current?.clickGain.gain.rampTo(value * 0.6, 0.02);
  }, []);

  const setFatness = useCallback((value: number) => {
    setFatnessState(value);
    if (nodesRef.current) nodesRef.current.dist.distortion = value;
  }, []);

  const setVolume = useCallback(
    (value: number) => {
      setVolumeState(value);
      nodesRef.current?.volumeGain.gain.rampTo(muted ? 0 : value / 100, 0.02);
    },
    [muted],
  );

  const setMuted = useCallback(
    (value: boolean) => {
      setMutedState(value);
      nodesRef.current?.volumeGain.gain.rampTo(value ? 0 : volume / 100, 0.02);
    },
    [volume],
  );

  const setPan = useCallback((value: number) => {
    setPanState(value);
    nodesRef.current?.panner.pan.rampTo(value / 100, 0.02);
  }, []);

  const trigger = async (scheduledTime?: number) => {
    if (scheduledTime === undefined) {
      await startAudioContext();
    }

    const nodes = nodesRef.current;
    if (!nodes) return; // not mounted yet

    const now = scheduledTime ?? Tone.now();
    triggerMasterFilterEnvelope(now);

    nodes.kick.triggerAttackRelease(pitch, length + RELEASE_TAIL, now); // "Pitch" knob
    nodes.click.triggerAttackRelease(CLICK_TRIGGER_DURATION, now);
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
