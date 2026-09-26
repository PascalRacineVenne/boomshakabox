import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { clamp } from "../../lib/clamp";

const CLICK_TONE = 1000;
const DEFAULT_VOLUME = 10;
const DEFAULT_MUTED = true;

export const useMetronomeClick = () => {
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [muted, setMutedState] = useState(DEFAULT_MUTED);

  const volumeRef = useRef(volume);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const gainRef = useRef<Tone.Gain | null>(null);

  useEffect(() => {
    const synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
    });
    const gain = new Tone.Gain(
      DEFAULT_MUTED ? 0 : DEFAULT_VOLUME / 100,
    ).toDestination();
    synth.connect(gain);
    gainRef.current = gain;

    const loop = new Tone.Loop((time) => {
      synth.triggerAttackRelease(CLICK_TONE, "32n", time);
    }, "4n").start(0);

    return () => {
      loop.dispose();
      synth.dispose();
      gain.dispose();
      gainRef.current = null;
    };
  }, []);

  const setVolume = useCallback((value: number) => {
    const clamped = clamp(value, 0, 100);
    setVolumeState(clamped);
    gainRef.current?.gain.rampTo(mutedRef.current ? 0 : clamped / 100, 0.02);
  }, []);

  const setMuted = useCallback((value: boolean) => {
    setMutedState(value);
    gainRef.current?.gain.rampTo(value ? 0 : volumeRef.current / 100, 0.02);
  }, []);

  return {
    volume,
    setVolume,
    muted,
    setMuted,
  };
};
