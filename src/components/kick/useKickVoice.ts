import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import {
  masterBusInput,
  triggerMasterFilterEnvelope,
} from "../../lib/masterBus";
import { startAudioContext } from "../../lib/startAudioContext";
import { SCOPE_WAVEFORM_SIZE } from "../../lib/voiceScope";

export const KICK_PITCH_MIN = 34;
export const KICK_PITCH_MAX = 72;
export const KICK_PUNCH_MIN = 2;
export const KICK_PUNCH_MAX = 9;
export const KICK_LENGTH_MIN = 0.12;
export const KICK_LENGTH_MAX = 2;
export const KICK_CLICK_MIN = 0;
export const KICK_CLICK_MAX = 1;
export const KICK_FATNESS_MIN = 0;
export const KICK_FATNESS_MAX = 1;

const PITCH_DECAY = 0.035;
const RELEASE_TAIL = 0.05;
const ENVELOPE_RELEASE = 0.05;
const CLICK_TRIGGER_DURATION = 0.02;

const OUTPUT_MAKEUP_GAIN = 1 / (0.75 * 0.75);

const DEFAULTS_KICK = {
  pitch: 48,
  punch: 5,
  decay: 0.32,
  click: 0.4,
  drive: 0,
};

interface KickChainParams {
  pitch: number;
  punch: number;
  length: number;
  click: number;
  fatness: number;
  level: number;
  pan: number;
}

// The full trigger()-chain topology, shared between live playback (connected
// to masterBusInput) and offline rendering (connected straight to an
// OfflineAudioContext's destination, for the full-waveform preview — see
// renderKickFullWaveform below). Nodes created in here bind to whatever
// context is "current" at call time, which is how Tone.Offline's callback
// captures them automatically as long as this runs synchronously inside it.
const buildAndTriggerKick = (
  { pitch, punch, length, click, fatness, level, pan }: KickChainParams,
  now: number,
  destination: Tone.ToneAudioNode,
  waveform?: Tone.Waveform | null,
) => {
  const duration = length + RELEASE_TAIL;

  const panner = new Tone.Panner(pan / 100).connect(destination);
  if (waveform) panner.connect(waveform); // parallel tap, doesn't affect the audible signal path
  const volumeGain = new Tone.Gain(level).connect(panner);
  const outputMakeup = new Tone.Gain(OUTPUT_MAKEUP_GAIN).connect(volumeGain);

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
    envelope: {
      attack: 0.001,
      decay: length,
      sustain: 0,
      release: ENVELOPE_RELEASE,
    },
  }).connect(dist);

  const clickFilter = new Tone.Filter(3200, "bandpass");
  clickFilter.Q.value = 0.7;
  const clickGain = new Tone.Gain(click * 0.6);
  const clickSynth = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.0005, decay: 0.012, sustain: 0 },
  });
  clickSynth.chain(clickFilter, clickGain, compressor);

  kick.triggerAttackRelease(pitch, duration, now);
  clickSynth.triggerAttackRelease(CLICK_TRIGGER_DURATION, now);

  return {
    duration,
    dispose: () => {
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
  };
};

// Renders one full hit through an OfflineAudioContext so the entire
// waveform — not just a live rolling window — can be captured and drawn at
// once. Skips triggerMasterFilterEnvelope (a global master-bus side effect
// that shouldn't fire from a background render) and startAudioContext (the
// offline context manages its own lifecycle).
const renderKickFullWaveform = async (
  params: KickChainParams,
): Promise<Float32Array> => {
  const renderLength =
    params.length + RELEASE_TAIL + ENVELOPE_RELEASE + 0.05;
  const buffer = await Tone.Offline(({ destination }) => {
    buildAndTriggerKick(params, 0, destination);
  }, renderLength);
  return buffer.getChannelData(0);
};

export const useKickVoice = () => {
  const [pitch, setPitch] = useState(DEFAULTS_KICK.pitch);
  const [punch, setPunch] = useState(DEFAULTS_KICK.punch);
  const [length, setLength] = useState(DEFAULTS_KICK.decay);
  const [click, setClick] = useState(DEFAULTS_KICK.click);
  const [fatness, setFatness] = useState(DEFAULTS_KICK.drive);
  const [volume, setVolume] = useState(75);
  const [pan, setPan] = useState(0);
  const [muted, setMuted] = useState(false);
  const [soloed, setSolo] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Prototype: a persistent Tone.Waveform this voice's panner taps into on
  // every hit (in parallel with masterBusInput, not instead of it), so a UI
  // component can read its current buffer for a live oscilloscope-style
  // display. Built/disposed in a mount-only effect rather than the render
  // body — see useADSR.ts for why (StrictMode's dev-only mount→cleanup→
  // mount replay leaves a render-body-created ref permanently null
  // otherwise). Every other node in trigger() stays ephemeral/per-hit as
  // usual; only this analyser is long-lived, since something has to be
  // there to read from between hits.
  const waveformRef = useRef<Tone.Waveform | null>(null);
  useEffect(() => {
    const waveform = new Tone.Waveform(SCOPE_WAVEFORM_SIZE);
    waveformRef.current = waveform;
    return () => {
      waveform.dispose();
      waveformRef.current = null;
    };
  }, []);

  const trigger = async (scheduledTime?: number, velocity = 100) => {
    if (scheduledTime === undefined) {
      await startAudioContext();
    }

    const now = scheduledTime ?? Tone.now();
    const level = muted ? 0 : (volume / 100) * (velocity / 100);

    triggerMasterFilterEnvelope(now);

    const { duration, dispose } = buildAndTriggerKick(
      { pitch, punch, length, click, fatness, level, pan },
      now,
      masterBusInput,
      waveformRef.current,
    );

    setTimeout(dispose, (duration + ENVELOPE_RELEASE + 0.1) * 1000);
  };

  // On-demand full-hit render for VoiceScope — a complete, static picture
  // of the current settings' hit, via Tone.Offline (see
  // renderKickFullWaveform above), unlike waveformRef's rolling few-ms
  // window. Deliberately not self-driving (no effect/state in here): only
  // called while a scope panel showing this voice is actually open, so
  // nothing renders offline audio for a voice nobody's looking at.
  const renderFullWaveform = useCallback(() => {
    const level = muted ? 0 : volume / 100;
    return renderKickFullWaveform({ pitch, punch, length, click, fatness, level, pan });
  }, [pitch, punch, length, click, fatness, volume, pan, muted]);

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
    waveformRef,
    renderFullWaveform,
  };
};
