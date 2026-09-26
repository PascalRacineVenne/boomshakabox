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

export const CLAP_TONE_MIN = 800;
export const CLAP_TONE_MAX = 1600;
export const CLAP_PUNCH_MIN = 1;
export const CLAP_PUNCH_MAX = 8;
export const CLAP_DECAY_MIN = 0.1;
export const CLAP_DECAY_MAX = 0.6;
export const CLAP_FATNESS_MIN = 0;
export const CLAP_FATNESS_MAX = 1;
export const CLAP_SNAP_MIN = 0;
export const CLAP_SNAP_MAX = 1;

const DEFAULTS_CLAP = {
  tone: 1000,
  punch: 3,
  decay: 0.5,
  fatness: 0,
  snap: 0.5,
};

// Burst envelope shape: 4-6 short noise pulses fired in quick succession.
// Chose the middle of that range.
const BURST_PULSE_COUNT = 5;
const BURST_PULSE_ATTACK = 0.001;
const BURST_PULSE_DECAY = 0.012;
// Snap knob scales the gap between pulses between these two extremes —
// higher snap = tighter/closer together ("flam"), lower = looser/separated.
const BURST_WIDE_INTERVAL = 0.022;
const BURST_TIGHT_INTERVAL = 0.006;
// Per the reference, the burst "starts off super chaotic, then trails
// off to a more regular burst" — only the first couple of pulses get
// randomized timing/amplitude; the rest land exactly on the regular grid.
const BURST_JITTER_PULSES = 2;
const BURST_JITTER_TIME_RATIO = 0.5;
const BURST_JITTER_AMOUNT = 0.4;

const RELEASE_TAIL = 0.05;

interface ClapChainParams {
  tone: number;
  punch: number;
  decay: number;
  fatness: number;
  snap: number;
  level: number;
  pan: number;
}

const burstPulseInterval = (snap: number) =>
  BURST_WIDE_INTERVAL - snap * (BURST_WIDE_INTERVAL - BURST_TIGHT_INTERVAL);

// Deterministic (no jitter) worst-case burst length, padded for the max
// possible timing jitter — used both to size the dispose timer and to
// size the offline render buffer, so neither ever gets cut short by the
// actual (randomized) pulse timing computed at trigger time.
const burstDuration = (snap: number) => {
  const paddedInterval =
    burstPulseInterval(snap) * (1 + BURST_JITTER_TIME_RATIO);
  return (
    (BURST_PULSE_COUNT - 1) * paddedInterval +
    BURST_PULSE_ATTACK +
    BURST_PULSE_DECAY
  );
};

const buildAndTriggerClap = (
  { tone, punch, decay, fatness, snap, level, pan }: ClapChainParams,
  now: number,
  destination: Tone.ToneAudioNode,
  waveform?: Tone.Waveform | null,
) => {
  const duration = Math.max(decay, burstDuration(snap));

  const panner = new Tone.Panner(pan / 100).connect(destination);
  if (waveform) panner.connect(waveform);
  const levelGain = new Tone.Gain(level).connect(panner);
  const limiter = new Tone.Limiter(-1).connect(levelGain);
  const compressor = new Tone.Compressor({
    threshold: -16,
    ratio: 4,
    attack: 0.003,
    release: 0.12,
  }).connect(limiter);
  const highpass = new Tone.Filter(28, "highpass").connect(compressor);
  const makeupGain = new Tone.Gain(2.4).connect(highpass);
  const lowpass = new Tone.Filter(9000, "lowpass").connect(makeupGain);

  const sum = new Tone.Gain(1).connect(lowpass);

  const bandpass = new Tone.Filter(tone, "bandpass");
  bandpass.Q.value = punch;
  const noise = new Tone.Noise("white").connect(bandpass);

  const tailGain = new Tone.Gain(0).connect(sum);
  bandpass.connect(tailGain);
  tailGain.gain.setValueAtTime(1, now);
  tailGain.gain.exponentialRampToValueAtTime(0.001, now + decay);

  const fold = new Tone.Distortion({
    distortion: fatness,
    oversample: "4x",
  }).connect(sum);
  const burstGain = new Tone.Gain(0).connect(fold);
  bandpass.connect(burstGain);

  const interval = burstPulseInterval(snap);
  let cursor = 0;
  for (let i = 0; i < BURST_PULSE_COUNT; i++) {
    const jitterFactor = Math.max(0, 1 - i / BURST_JITTER_PULSES);
    if (i > 0) {
      const timeJitter =
        jitterFactor *
        BURST_JITTER_TIME_RATIO *
        interval *
        (Math.random() - 0.5) *
        2;
      cursor += interval + timeJitter;
    }
    const peakAmp = 1 - jitterFactor * BURST_JITTER_AMOUNT * Math.random();
    const pulseStart = now + cursor;
    burstGain.gain.setValueAtTime(0.0001, pulseStart);
    burstGain.gain.linearRampToValueAtTime(
      peakAmp,
      pulseStart + BURST_PULSE_ATTACK,
    );
    burstGain.gain.exponentialRampToValueAtTime(
      0.0001,
      pulseStart + BURST_PULSE_ATTACK + BURST_PULSE_DECAY,
    );
  }

  noise.start(now);
  noise.stop(now + duration + RELEASE_TAIL);

  return {
    duration,
    dispose: () => {
      noise.dispose();
      bandpass.dispose();
      tailGain.dispose();
      burstGain.dispose();
      fold.dispose();
      sum.dispose();
      lowpass.dispose();
      makeupGain.dispose();
      highpass.dispose();
      compressor.dispose();
      limiter.dispose();
      levelGain.dispose();
      panner.dispose();
    },
  };
};

export const useClapVoice = () => {
  const [tone, setTone] = useState(DEFAULTS_CLAP.tone);
  const [punch, setPunch] = useState(DEFAULTS_CLAP.punch);
  const [decay, setDecay] = useState(DEFAULTS_CLAP.decay);
  const [fatness, setFatness] = useState(DEFAULTS_CLAP.fatness);
  const [snap, setSnap] = useState(DEFAULTS_CLAP.snap);
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

    const { duration, dispose } = buildAndTriggerClap(
      { tone, punch, decay, fatness, snap, level, pan },
      now,
      masterBusInput,
      waveformRef.current,
    );

    setTimeout(dispose, (duration + RELEASE_TAIL + 0.1) * 1000);
  };

  const renderFullWaveform = useCallback(() => {
    const level = computeLevel(muted, volume);
    const renderLength =
      Math.max(decay, burstDuration(snap)) + RELEASE_TAIL + 0.05;
    return renderOfflineWaveform(renderLength, (now, destination) =>
      buildAndTriggerClap(
        { tone, punch, decay, fatness, snap, level, pan },
        now,
        destination,
      ),
    );
  }, [tone, punch, decay, fatness, snap, volume, pan, muted]);

  return {
    tone,
    setTone,
    punch,
    setPunch,
    decay,
    setDecay,
    fatness,
    setFatness,
    snap,
    setSnap,
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
