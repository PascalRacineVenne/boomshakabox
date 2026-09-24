import { useCallback, useState } from "react";
import * as Tone from "tone";
import { HI_HAT_OSCILLATOR_FREQUENCIES } from "../../lib/hiHatOscillatorFrequencies";
import {
  masterBusInput,
  triggerMasterFilterEnvelope,
} from "../../lib/masterBus";
import { startAudioContext } from "../../lib/startAudioContext";
import { renderOfflineWaveform, useScopeWaveform } from "../../lib/voiceScope";
import { computeLevel } from "../../lib/voiceLevel";

interface HiHatOpenChainParams {
  tone: number;
  decay: number;
  level: number;
  pan: number;
}

// Shared between live playback (connected to masterBusInput) and offline
// rendering for VoiceScope's full-waveform preview (connected to an
// OfflineAudioContext's destination instead) — see useKickVoice.ts for why
// this split exists.
const buildAndTriggerHiHatOpen = (
  { tone, decay, level, pan }: HiHatOpenChainParams,
  now: number,
  destination: Tone.ToneAudioNode,
  waveform?: Tone.Waveform | null,
) => {
  const filter = new Tone.Filter(tone, "highpass");

  const ampGain = new Tone.Gain(1);
  ampGain.gain.setValueAtTime(level, now);
  ampGain.gain.exponentialRampToValueAtTime(0.001, now + decay);
  filter.connect(ampGain);

  const panner = new Tone.Panner(pan / 100).connect(destination);
  if (waveform) panner.connect(waveform); // parallel tap, doesn't affect the audible signal path
  ampGain.connect(panner);

  const oscillators = HI_HAT_OSCILLATOR_FREQUENCIES.map((freq) => {
    const osc = new Tone.Oscillator(freq, "square").connect(filter);
    osc.start(now);
    osc.stop(now + decay);
    return osc;
  });

  return {
    duration: decay,
    dispose: () => {
      oscillators.forEach((osc) => osc.dispose());
      filter.dispose();
      ampGain.dispose();
      panner.dispose();
    },
  };
};

const renderHiHatOpenFullWaveform = (params: HiHatOpenChainParams) =>
  renderOfflineWaveform(params.decay + 0.05, (now, destination) =>
    buildAndTriggerHiHatOpen(params, now, destination),
  );

export const useHiHatOpenVoice = () => {
  const [tone, setTone] = useState(7000);
  const [decay, setDecay] = useState(0.4);
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

    const { duration, dispose } = buildAndTriggerHiHatOpen(
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
    return renderHiHatOpenFullWaveform({ tone, decay, level, pan });
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
