import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { startAudioContext } from "../../lib/startAudioContext";
import {
  masterBusInput,
  triggerMasterFilterEnvelope,
} from "../../lib/masterBus";
import { distortionMakeupGain } from "../../lib/distortionMakeupGain";
import { SCOPE_WAVEFORM_SIZE } from "../../lib/voiceScope";

export const TONE_MIN = 120;
export const TONE_MAX = 160;
export const DECAY_MIN = 0.08;
export const DECAY_MAX = 0.6;

const PITCH_DROP_RATIO = 1.15;
const FILTER_Q = 3;
const PITCH_DROP_TIME = 0.025;
const DISTORTION_AMOUNT = 0.04;

interface MidTomChainParams {
  tone: number;
  decay: number;
  level: number;
  pan: number;
}

// Shared between live playback (connected to masterBusInput) and offline
// rendering for VoiceScope's full-waveform preview (connected to an
// OfflineAudioContext's destination instead) — see useKickVoice.ts for why
// this split exists.
const buildAndTriggerMidTom = (
  { tone, decay, level, pan }: MidTomChainParams,
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

const renderMidTomFullWaveform = async (
  params: MidTomChainParams,
): Promise<Float32Array> => {
  const buffer = await Tone.Offline(({ destination }) => {
    buildAndTriggerMidTom(params, 0, destination);
  }, params.decay + 0.05);
  return buffer.getChannelData(0);
};

export const useMidTomVoice = () => {
  const [tone, setTone] = useState(140);
  const [decay, setDecay] = useState(0.13);
  const [volume, setVolume] = useState(75);
  const [pan, setPan] = useState(0);
  const [muted, setMuted] = useState(false);
  const [soloed, setSolo] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Persistent live-oscilloscope tap — see useKickVoice.ts's waveformRef
  // for the full rationale (mount-only effect, StrictMode-safe).
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

    const { duration, dispose } = buildAndTriggerMidTom(
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
    const level = muted ? 0 : volume / 100;
    return renderMidTomFullWaveform({ tone, decay, level, pan });
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
