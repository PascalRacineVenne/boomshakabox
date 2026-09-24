import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import * as Tone from "tone";

export const SCOPE_WAVEFORM_SIZE = 256;

export interface VoiceScopeSource {
  waveformRef: RefObject<Tone.Waveform | null>;
  renderFullWaveform: () => Promise<Float32Array>;
}

export const useScopeWaveform = () => {
  const waveformRef = useRef<Tone.Waveform | null>(null);
  useEffect(() => {
    const waveform = new Tone.Waveform(SCOPE_WAVEFORM_SIZE);
    waveformRef.current = waveform;
    return () => {
      waveform.dispose();
      waveformRef.current = null;
    };
  }, []);
  return waveformRef;
};

export const renderOfflineWaveform = async (
  duration: number,
  build: (now: number, destination: Tone.ToneAudioNode) => void,
): Promise<Float32Array> => {
  const buffer = await Tone.Offline(
    ({ destination }) => build(0, destination),
    duration,
  );

  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  console.log({ left, right });
  return left.map((sample, i) => (sample + right[i]) / 2);
};
