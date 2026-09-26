import { useCallback, useState } from "react";
import * as Tone from "tone";
import {
  masterBusInput,
  triggerMasterFilterEnvelope,
} from "../../../lib/masterBus";
import { startAudioContext } from "../../../lib/startAudioContext";
import {
  renderOfflineWaveform,
  useScopeWaveform,
} from "../../../lib/voiceScope";
import { computeLevel } from "../../../lib/voiceLevel";

export const KICK_PITCH_MIN = 34;
export const KICK_PITCH_MAX = 72;
export const KICK_PUNCH_MIN = 2;
export const KICK_PUNCH_MAX = 9;
export const KICK_LENGTH_MIN = 0.12;
export const KICK_LENGTH_MAX = 3;
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

const buildAndTriggerKick = (
  { pitch, punch, length, click, fatness, level, pan }: KickChainParams,
  now: number,
  destination: Tone.ToneAudioNode,
  waveform?: Tone.Waveform | null,
) => {
  const duration = length + RELEASE_TAIL;

  const panner = new Tone.Panner(pan / 100).connect(destination);
  if (waveform) panner.connect(waveform);
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

  const waveformRef = useScopeWaveform();

  const trigger = async (scheduledTime?: number, velocity = 100) => {
    if (scheduledTime === undefined) {
      await startAudioContext();
    }

    const now = scheduledTime ?? Tone.now();
    const level = computeLevel(muted, volume, velocity);

    triggerMasterFilterEnvelope(now);

    const { duration, dispose } = buildAndTriggerKick(
      { pitch, punch, length, click, fatness, level, pan },
      now,
      masterBusInput,
      waveformRef.current,
    );

    setTimeout(dispose, (duration + ENVELOPE_RELEASE + 0.1) * 1000);
  };

  const renderFullWaveform = useCallback(() => {
    const level = computeLevel(muted, volume);
    const renderLength = length + RELEASE_TAIL + ENVELOPE_RELEASE + 0.05;
    return renderOfflineWaveform(renderLength, (now, destination) =>
      buildAndTriggerKick(
        { pitch, punch, length, click, fatness, level, pan },
        now,
        destination,
      ),
    );
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
