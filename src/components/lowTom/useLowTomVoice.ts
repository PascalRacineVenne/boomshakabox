import { useCallback, useState } from "react";
import * as Tone from "tone";
import { startAudioContext } from "../../lib/startAudioContext";
import {
  masterBusInput,
  triggerMasterFilterEnvelope,
} from "../../lib/masterBus";
import { distortionMakeupGain } from "../../lib/distortionMakeupGain";
import { renderOfflineWaveform, useScopeWaveform } from "../../lib/voiceScope";
import { computeLevel } from "../../lib/voiceLevel";

export const TONE_MIN = 80;
export const TONE_MAX = 100;
export const DECAY_MIN = 0.08;
export const DECAY_MAX = 0.6;

const PITCH_DROP_RATIO = 1.15;
const FILTER_Q = 3;
const PITCH_DROP_TIME = 0.025;
const DISTORTION_AMOUNT = 0.04;

interface LowTomChainParams {
  tone: number;
  decay: number;
  level: number;
  pan: number;
}

// Shared between live playback (connected to masterBusInput) and offline
// rendering for VoiceScope's full-waveform preview (connected to an
// OfflineAudioContext's destination instead) — see useKickVoice.ts for why
// this split exists.
const buildAndTriggerLowTom = (
  { tone, decay, level, pan }: LowTomChainParams,
  now: number,
  destination: Tone.ToneAudioNode,
  waveform?: Tone.Waveform | null,
) => {
  const osc = new Tone.Oscillator(tone * PITCH_DROP_RATIO, "sine");
  osc.frequency.exponentialRampToValueAtTime(tone, now + PITCH_DROP_TIME);

  const filter = new Tone.Filter(tone, "bandpass");
  filter.Q.value = FILTER_Q;

  const saturation = new Tone.Distortion(DISTORTION_AMOUNT);
  saturation.oversample = "2x";

  const makeupGain = new Tone.Gain(distortionMakeupGain(DISTORTION_AMOUNT));

  const ampGain = new Tone.Gain(1);
  ampGain.gain.setValueAtTime(level, now);
  ampGain.gain.exponentialRampToValueAtTime(0.001, now + decay);

  const panner = new Tone.Panner(pan / 100).connect(destination);
  if (waveform) panner.connect(waveform); // parallel tap, doesn't affect the audible signal path

  osc.connect(filter);
  filter.connect(saturation);
  saturation.connect(makeupGain);
  makeupGain.connect(ampGain);
  ampGain.connect(panner);
  osc.start(now);
  osc.stop(now + decay);

  return {
    duration: decay,
    dispose: () => {
      osc.dispose();
      filter.dispose();
      saturation.dispose();
      makeupGain.dispose();
      ampGain.dispose();
      panner.dispose();
    },
  };
};

const renderLowTomFullWaveform = (params: LowTomChainParams) =>
  renderOfflineWaveform(params.decay + 0.05, (now, destination) =>
    buildAndTriggerLowTom(params, now, destination),
  );

export const useLowTomVoice = () => {
  const [tone, setTone] = useState(90);
  const [decay, setDecay] = useState(0.2);
  const [volume, setVolume] = useState(75);
  const [pan, setPan] = useState(0);
  const [muted, setMuted] = useState(false);
  const [soloed, setSolo] = useState(false);
  const [pressed, setPressed] = useState(false);

  const waveformRef = useScopeWaveform();

  const trigger = async (scheduledTime?: number, velocity = 100) => {
    if (scheduledTime === undefined) {
      await startAudioContext();
    }

    const now = scheduledTime ?? Tone.now();
    const level = computeLevel(muted, volume, velocity);

    triggerMasterFilterEnvelope(now);

    const { duration, dispose } = buildAndTriggerLowTom(
      { tone, decay, level, pan },
      now,
      masterBusInput,
      waveformRef.current,
    );

    setTimeout(dispose, (duration + 0.1) * 1000);
  };

  // On-demand full-hit render for VoiceScope — see useKickVoice.ts's
  // renderFullWaveform for why this isn't a self-driving effect.
  const renderFullWaveform = useCallback(() => {
    const level = computeLevel(muted, volume);
    return renderLowTomFullWaveform({ tone, decay, level, pan });
  }, [tone, decay, volume, pan, muted]);

  return {
    tone,
    setTone,
    decay,
    setDecay,
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
