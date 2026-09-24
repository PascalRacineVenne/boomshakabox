import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import * as Tone from "tone";

// Shared by every useXVoice.ts hook's live-oscilloscope tap — small enough
// to redraw every animation frame cheaply.
export const SCOPE_WAVEFORM_SIZE = 256;

// The minimal shape VoiceScope.tsx needs from a voice hook's return value —
// every useXVoice.ts hook satisfies this structurally.
export interface VoiceScopeSource {
  waveformRef: RefObject<Tone.Waveform | null>;
  renderFullWaveform: () => Promise<Float32Array>;
}

// A persistent Tone.Waveform this voice's panner taps into on every hit (in
// parallel with masterBusInput, not instead of it), so a UI component can
// read its current buffer for a live oscilloscope-style display. Built and
// disposed in a mount-only effect rather than the render body — see
// useADSR.ts for why (StrictMode's dev-only mount→cleanup→mount replay
// leaves a render-body-created ref permanently null otherwise). Every other
// node in a voice's trigger() stays ephemeral/per-hit as usual; only this
// analyser is long-lived, since something has to be there to read from
// between hits.
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

// Renders one full hit through an OfflineAudioContext so the entire
// waveform — not just a live rolling window — can be captured and drawn at
// once. `build` is a voice's buildAndTriggerX function (or a thin wrapper
// around it); it's called with `now = 0` and the offline context's own
// destination, which is how Tone.Offline's callback captures nodes
// automatically as long as they're created synchronously inside it.
export const renderOfflineWaveform = async (
  duration: number,
  build: (now: number, destination: Tone.ToneAudioNode) => void,
): Promise<Float32Array> => {
  const buffer = await Tone.Offline(
    ({ destination }) => build(0, destination),
    duration,
  );
  return buffer.getChannelData(0);
};
