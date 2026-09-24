import type { RefObject } from "react";
import type * as Tone from "tone";

// Shared by every useXVoice.ts hook's live-oscilloscope tap — small enough
// to redraw every animation frame cheaply.
export const SCOPE_WAVEFORM_SIZE = 256;

// The minimal shape VoiceScope.tsx needs from a voice hook's return value —
// every useXVoice.ts hook satisfies this structurally.
export interface VoiceScopeSource {
  waveformRef: RefObject<Tone.Waveform | null>;
  renderFullWaveform: () => Promise<Float32Array>;
}
