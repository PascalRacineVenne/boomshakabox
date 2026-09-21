import {
  PANNING_L,
  PANNING_R,
  VOLUME_MAX,
  VOLUME_MIN,
  formatPan,
} from "../components/ControlPanel";
import { distortionMakeupGain } from "../lib/distortionMakeupGain";
import { HI_HAT_OSCILLATOR_FREQUENCIES } from "../lib/hiHatOscillatorFrequencies";

import {
  KICK_DECAY_MAX,
  KICK_DECAY_MIN,
  KICK_TONE_MAX,
  KICK_TONE_MIN,
  useKickVoice,
} from "../components/kick/useKickVoice";
import {
  KICK2_CLICK_MAX,
  KICK2_CLICK_MIN,
  KICK2_FATNESS_MAX,
  KICK2_FATNESS_MIN,
  KICK2_LENGTH_MAX,
  KICK2_LENGTH_MIN,
  KICK2_PITCH_MAX,
  KICK2_PITCH_MIN,
  KICK2_PUNCH_MAX,
  KICK2_PUNCH_MIN,
  useKick2Voice,
} from "../components/kick2/useKick2Voice";
import {
  KICKSAUCE_CLICK_MAX,
  KICKSAUCE_CLICK_MIN,
  KICKSAUCE_FATNESS_MAX,
  KICKSAUCE_FATNESS_MIN,
  KICKSAUCE_LENGTH_MAX,
  KICKSAUCE_LENGTH_MIN,
  KICKSAUCE_PITCH_MAX,
  KICKSAUCE_PITCH_MIN,
  KICKSAUCE_PUNCH_MAX,
  KICKSAUCE_PUNCH_MIN,
  useKickSauceVoice,
} from "../components/kickSauce/useKickSauceVoice";
import {
  SNARE_SNAPPY_MAX,
  SNARE_SNAPPY_MIN,
  SNARE_TONE_MAX,
  SNARE_TONE_MIN,
  useSnareVoice,
} from "../components/snare/useSnareVoice";
import {
  HH_TONE_MAX,
  HH_TONE_MIN,
  useHiHatVoice,
} from "../components/hihat/useHiHatVoice";
import { useHiHatOpenVoice } from "../components/hihatOpen/useHiHatOpenVoice";
import {
  DECAY_MAX as HITOM_DECAY_MAX,
  DECAY_MIN as HITOM_DECAY_MIN,
  TONE_MAX as HITOM_TONE_MAX,
  TONE_MIN as HITOM_TONE_MIN,
  useHiTomVoice,
} from "../components/hiTom/useHiTomVoice";
import {
  DECAY_MAX as MIDTOM_DECAY_MAX,
  DECAY_MIN as MIDTOM_DECAY_MIN,
  TONE_MAX as MIDTOM_TONE_MAX,
  TONE_MIN as MIDTOM_TONE_MIN,
  useMidTomVoice,
} from "../components/midTom/useMidTomVoice";
import {
  DECAY_MAX as LOWTOM_DECAY_MAX,
  DECAY_MIN as LOWTOM_DECAY_MIN,
  TONE_MAX as LOWTOM_TONE_MAX,
  TONE_MIN as LOWTOM_TONE_MIN,
  useLowTomVoice,
} from "../components/lowTom/useLowTomVoice";

import type { TrackId } from "./useStepSequencer";

/** One entry per {@link TrackId} — the exact shape `StepSequencer` already builds for `useStepSequencer`. */
export interface AllVoices {
  kick: ReturnType<typeof useKickVoice>;
  kick2: ReturnType<typeof useKick2Voice>;
  kickSauce: ReturnType<typeof useKickSauceVoice>;
  snare: ReturnType<typeof useSnareVoice>;
  hihat: ReturnType<typeof useHiHatVoice>;
  hihatOpen: ReturnType<typeof useHiHatOpenVoice>;
  hiTom: ReturnType<typeof useHiTomVoice>;
  midTom: ReturnType<typeof useMidTomVoice>;
  lowTom: ReturnType<typeof useLowTomVoice>;
}

export interface VoiceParamRow {
  key: string;
  stage: string;
  detail: string;
  parameter: string;
  value: string;
  live: boolean;
  control: string;
}

const HEX_BANK_HZ =
  HI_HAT_OSCILLATOR_FREQUENCIES.map((f) => Math.round(f)).join(", ") + " Hz";

const masterEnvRow = (): VoiceParamRow => ({
  key: "master-env",
  stage: "Master Filter Env",
  detail: "shared envelope, fires on every hit of every voice",
  parameter: "—",
  value: "triggered",
  live: false,
  control: "See Filter panel (Env Amount) — not per-voice",
});

const kickRows = (v: AllVoices["kick"]): VoiceParamRow[] => [
  {
    key: "osc-wave",
    stage: "Oscillator",
    detail: "1x sine, pitch envelope",
    parameter: "Waveform",
    value: "sine",
    live: false,
    control: "Fixed in code",
  },
  {
    key: "osc-start",
    stage: "Oscillator",
    detail: "1x sine, pitch envelope",
    parameter: "Start Freq",
    value: "180 Hz",
    live: false,
    control: "Fixed in code — the pitch-glide's starting \"click\"",
  },
  {
    key: "osc-glide",
    stage: "Oscillator",
    detail: "1x sine, pitch envelope",
    parameter: "Glide Time",
    value: "50 ms",
    live: false,
    control: "Fixed in code",
  },
  {
    key: "osc-settle",
    stage: "Oscillator",
    detail: "1x sine, pitch envelope",
    parameter: "Settle Freq (Tone)",
    value: `${v.tone} Hz`,
    live: true,
    control: `Tone knob (${KICK_TONE_MIN}–${KICK_TONE_MAX} Hz)`,
  },
  {
    key: "dist-amount",
    stage: "Distortion",
    detail: "Tone.Distortion, 2x oversample",
    parameter: "Amount",
    value: "0.1",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "dist-makeup",
    stage: "Distortion",
    detail: "Tone.Distortion, 2x oversample",
    parameter: "Makeup Gain",
    value: `${distortionMakeupGain(0.1).toFixed(2)}x`,
    live: false,
    control: "Derived from Amount",
  },
  {
    key: "vca-peak",
    stage: "VCA (Amp Envelope)",
    detail: "instant attack, exponential decay",
    parameter: "Peak Level",
    value: v.muted ? "0% (muted)" : `${v.volume}%`,
    live: true,
    control: `Volume slider (${VOLUME_MIN}–${VOLUME_MAX}%)`,
  },
  {
    key: "vca-decay",
    stage: "VCA (Amp Envelope)",
    detail: "instant attack, exponential decay",
    parameter: "Decay",
    value: `${v.decay.toFixed(2)}s`,
    live: true,
    control: `Decay knob (${KICK_DECAY_MIN}–${KICK_DECAY_MAX}s)`,
  },
  {
    key: "pan",
    stage: "Pan",
    detail: "stereo panner, post-VCA",
    parameter: "Position",
    value: formatPan(v.pan),
    live: true,
    control: `Pan knob (${PANNING_L}–${PANNING_R})`,
  },
  masterEnvRow(),
];

const kick2Rows = (v: AllVoices["kick2"]): VoiceParamRow[] => [
  {
    key: "osc-wave",
    stage: "Oscillator",
    detail: "1x sine, pitch envelope",
    parameter: "Waveform",
    value: "sine",
    live: false,
    control: "Fixed in code",
  },
  {
    key: "osc-punch",
    stage: "Oscillator",
    detail: "1x sine, pitch envelope",
    parameter: "Punch (octaves above Pitch)",
    value: `${v.punch}`,
    live: true,
    control: `Punch knob (${KICK2_PUNCH_MIN}–${KICK2_PUNCH_MAX})`,
  },
  {
    key: "osc-start",
    stage: "Oscillator",
    detail: "1x sine, pitch envelope",
    parameter: "Start Freq",
    value: `${Math.round(v.pitch * 2 ** v.punch)} Hz`,
    live: true,
    control: "Pitch × 2^Punch",
  },
  {
    key: "osc-glide",
    stage: "Oscillator",
    detail: "1x sine, pitch envelope",
    parameter: "Glide Time",
    value: "35 ms",
    live: false,
    control: "Fixed in code",
  },
  {
    key: "osc-settle",
    stage: "Oscillator",
    detail: "1x sine, pitch envelope",
    parameter: "Settle Freq (Pitch)",
    value: `${v.pitch} Hz`,
    live: true,
    control: `Pitch knob (${KICK2_PITCH_MIN}–${KICK2_PITCH_MAX} Hz)`,
  },
  {
    key: "dist-amount",
    stage: "Distortion",
    detail: "Tone.Distortion, 4x oversample",
    parameter: "Amount (Fatness)",
    value: `${v.fatness}`,
    live: true,
    control: `Fatness knob (${KICK2_FATNESS_MIN}–${KICK2_FATNESS_MAX})`,
  },
  {
    key: "dist-makeup",
    stage: "Distortion",
    detail: "Tone.Distortion, 4x oversample",
    parameter: "Makeup Gain",
    value: `${distortionMakeupGain(v.fatness).toFixed(2)}x`,
    live: true,
    control: "Derived from Fatness",
  },
  {
    key: "lowpass",
    stage: "Filter",
    detail: "lowpass, post-Distortion",
    parameter: "Cutoff",
    value: "9000 Hz",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "vca-peak",
    stage: "VCA (Amp Envelope)",
    detail: "instant attack, exponential decay",
    parameter: "Peak Level",
    value: v.muted ? "0% (muted)" : `${v.volume}%`,
    live: true,
    control: `Volume slider (${VOLUME_MIN}–${VOLUME_MAX}%)`,
  },
  {
    key: "vca-decay",
    stage: "VCA (Amp Envelope)",
    detail: "instant attack, exponential decay",
    parameter: "Decay (Length)",
    value: `${v.length.toFixed(2)}s`,
    live: true,
    control: `Length knob (${KICK2_LENGTH_MIN}–${KICK2_LENGTH_MAX}s)`,
  },
  {
    key: "click-filter",
    stage: "Filter (Click layer)",
    detail: "bandpass on white noise, bypasses Distortion",
    parameter: "Cutoff",
    value: "3200 Hz",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "click-filter-q",
    stage: "Filter (Click layer)",
    detail: "bandpass on white noise, bypasses Distortion",
    parameter: "Q",
    value: "0.7",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "click-vca",
    stage: "VCA (Click layer)",
    detail: "exponential decay, ~30ms burst",
    parameter: "Mix (Click)",
    value: `${v.click}`,
    live: true,
    control: `Click knob (${KICK2_CLICK_MIN}–${KICK2_CLICK_MAX})`,
  },
  {
    key: "pan",
    stage: "Pan",
    detail: "stereo panner, shared by body and click layer",
    parameter: "Position",
    value: formatPan(v.pan),
    live: true,
    control: `Pan knob (${PANNING_L}–${PANNING_R})`,
  },
  masterEnvRow(),
];

const kickSauceRows = (v: AllVoices["kickSauce"]): VoiceParamRow[] => [
  {
    key: "membrane-wave",
    stage: "MembraneSynth (body)",
    detail: "persistent Tone.js instrument, not per-hit ephemeral nodes",
    parameter: "Waveform",
    value: "sine",
    live: false,
    control: "Fixed in code",
  },
  {
    key: "membrane-punch",
    stage: "MembraneSynth (body)",
    detail: "persistent Tone.js instrument, not per-hit ephemeral nodes",
    parameter: "Octaves (Punch)",
    value: `${v.punch}`,
    live: true,
    control: `Punch knob (${KICKSAUCE_PUNCH_MIN}–${KICKSAUCE_PUNCH_MAX})`,
  },
  {
    key: "membrane-pitchdecay",
    stage: "MembraneSynth (body)",
    detail: "persistent Tone.js instrument, not per-hit ephemeral nodes",
    parameter: "Pitch Decay",
    value: "35 ms",
    live: false,
    control: "Fixed in code",
  },
  {
    key: "membrane-note",
    stage: "MembraneSynth (body)",
    detail: "persistent Tone.js instrument, not per-hit ephemeral nodes",
    parameter: "Note (Pitch)",
    value: `${v.pitch} Hz`,
    live: true,
    control: `Pitch knob (${KICKSAUCE_PITCH_MIN}–${KICKSAUCE_PITCH_MAX} Hz)`,
  },
  {
    key: "membrane-decay",
    stage: "MembraneSynth (body)",
    detail: "persistent Tone.js instrument, not per-hit ephemeral nodes",
    parameter: "Envelope Decay (Length)",
    value: `${v.length.toFixed(2)}s`,
    live: true,
    control: `Length knob (${KICKSAUCE_LENGTH_MIN}–${KICKSAUCE_LENGTH_MAX}s)`,
  },
  {
    key: "dist-amount",
    stage: "Distortion",
    detail: "Tone.Distortion, 4x oversample",
    parameter: "Amount (Fatness)",
    value: `${v.fatness}`,
    live: true,
    control: `Fatness knob (${KICKSAUCE_FATNESS_MIN}–${KICKSAUCE_FATNESS_MAX})`,
  },
  {
    key: "lowpass",
    stage: "Filter",
    detail: "lowpass, post-Distortion",
    parameter: "Cutoff",
    value: "9000 Hz",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "makeup",
    stage: "Gain",
    detail: "fixed makeup stage, post-lowpass",
    parameter: "Gain",
    value: "2.4x",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "highpass",
    stage: "Filter",
    detail: "highpass, rumble control before the compressor",
    parameter: "Cutoff",
    value: "28 Hz",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "compressor",
    stage: "Compressor",
    detail: "shared by body and click layer",
    parameter: "Threshold / Ratio",
    value: "-16dB / 4:1",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "limiter",
    stage: "Limiter",
    detail: "final ceiling before Volume/Pan",
    parameter: "Threshold",
    value: "-1dB",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "output-makeup",
    stage: "Gain",
    detail: "post-Limiter, before this app's own Volume/Pan stage",
    parameter: "Gain",
    value: "1.78x (+5dB)",
    live: false,
    control:
      "Fixed in code — compensates for this app's Volume + Master Volume defaults (75%/75%) the reference never had to pass through",
  },
  {
    key: "click-filter",
    stage: "Filter (Click layer)",
    detail: "bandpass on NoiseSynth, bypasses Distortion/lowpass/makeup/highpass",
    parameter: "Cutoff",
    value: "3200 Hz",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "click-filter-q",
    stage: "Filter (Click layer)",
    detail: "bandpass on NoiseSynth, bypasses Distortion/lowpass/makeup/highpass",
    parameter: "Q",
    value: "0.7",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "click-vca",
    stage: "VCA (Click layer)",
    detail: "NoiseSynth's own envelope, ~12ms decay",
    parameter: "Mix (Click)",
    value: `${v.click}`,
    live: true,
    control: `Click knob (${KICKSAUCE_CLICK_MIN}–${KICKSAUCE_CLICK_MAX})`,
  },
  {
    key: "vca-peak",
    stage: "VCA (Volume)",
    detail: "final Gain stage, post-Limiter",
    parameter: "Peak Level",
    value: v.muted ? "0% (muted)" : `${v.volume}%`,
    live: true,
    control: `Volume slider (${VOLUME_MIN}–${VOLUME_MAX}%)`,
  },
  {
    key: "pan",
    stage: "Pan",
    detail: "stereo panner, shared by body and click layer",
    parameter: "Position",
    value: formatPan(v.pan),
    live: true,
    control: `Pan knob (${PANNING_L}–${PANNING_R})`,
  },
  masterEnvRow(),
];

const SNARE_TONE_RATIO = 330 / 180; // mirrors useSnareVoice.ts's TONE_VOICE_RATIO

const snareRows = (v: AllVoices["snare"]): VoiceParamRow[] => [
  {
    key: "osc-wave",
    stage: "Oscillator (Tone voice)",
    detail: "2x triangle, summed",
    parameter: "Waveform",
    value: "triangle",
    live: false,
    control: "Fixed in code",
  },
  {
    key: "osc-freq1",
    stage: "Oscillator (Tone voice)",
    detail: "2x triangle, summed",
    parameter: "Osc 1 Freq (Tone)",
    value: `${v.tone} Hz`,
    live: true,
    control: `Tone knob (${SNARE_TONE_MIN}–${SNARE_TONE_MAX} Hz)`,
  },
  {
    key: "osc-freq2",
    stage: "Oscillator (Tone voice)",
    detail: "2x triangle, summed",
    parameter: "Osc 2 Freq",
    value: `${Math.round(v.tone * SNARE_TONE_RATIO)} Hz`,
    live: true,
    control: "Fixed ratio (330/180) of Tone knob",
  },
  {
    key: "tone-vca-mix",
    stage: "VCA (Tone voice)",
    detail: "exponential decay",
    parameter: "Mix Weight",
    value: "0.7",
    live: false,
    control: "Fixed in code",
  },
  {
    key: "tone-vca-decay",
    stage: "VCA (Tone voice)",
    detail: "exponential decay",
    parameter: "Decay",
    value: "0.2s",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "noise-filter",
    stage: "Filter (Snap voice)",
    detail: "highpass on white noise",
    parameter: "Cutoff",
    value: "1000 Hz",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "snap-vca-mix",
    stage: "VCA (Snap voice)",
    detail: "exponential decay",
    parameter: "Mix (Snappy)",
    value: `${v.snappy}`,
    live: true,
    control: `Snappy knob (${SNARE_SNAPPY_MIN}–${SNARE_SNAPPY_MAX})`,
  },
  {
    key: "snap-vca-decay",
    stage: "VCA (Snap voice)",
    detail: "exponential decay",
    parameter: "Decay",
    value: "0.2s",
    live: false,
    control: "Fixed in code — not exposed, same as Tone voice's decay",
  },
  {
    key: "vca-peak",
    stage: "VCA (both voices)",
    detail: "shared level multiplier",
    parameter: "Peak Level",
    value: v.muted ? "0% (muted)" : `${v.volume}%`,
    live: true,
    control: `Volume slider (${VOLUME_MIN}–${VOLUME_MAX}%)`,
  },
  {
    key: "pan",
    stage: "Pan",
    detail: "stereo panner, shared by both voices",
    parameter: "Position",
    value: formatPan(v.pan),
    live: true,
    control: `Pan knob (${PANNING_L}–${PANNING_R})`,
  },
  masterEnvRow(),
];

const hihatRows = (v: AllVoices["hihat"]): VoiceParamRow[] => [
  {
    key: "osc-bank",
    stage: "Oscillator",
    detail: "6x square, fixed 808 hex bank",
    parameter: "Frequencies",
    value: HEX_BANK_HZ,
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "filter",
    stage: "Filter",
    detail: "highpass, post-oscillator bank",
    parameter: "Cutoff (Tone)",
    value: `${v.tone} Hz`,
    live: true,
    control: `Tone knob (${HH_TONE_MIN}–${HH_TONE_MAX} Hz)`,
  },
  {
    key: "vca-peak",
    stage: "VCA (Amp Envelope)",
    detail: "instant attack, exponential decay",
    parameter: "Peak Level",
    value: v.muted ? "0% (muted)" : `${v.volume}%`,
    live: true,
    control: `Volume slider (${VOLUME_MIN}–${VOLUME_MAX}%)`,
  },
  {
    key: "vca-decay",
    stage: "VCA (Amp Envelope)",
    detail: "instant attack, exponential decay",
    parameter: "Decay",
    value: "50 ms",
    live: false,
    control: 'Fixed in code — this is what makes it read as "closed"',
  },
  {
    key: "pan",
    stage: "Pan",
    detail: "stereo panner, post-VCA",
    parameter: "Position",
    value: formatPan(v.pan),
    live: true,
    control: `Pan knob (${PANNING_L}–${PANNING_R})`,
  },
  masterEnvRow(),
];

const hihatOpenRows = (v: AllVoices["hihatOpen"]): VoiceParamRow[] => [
  {
    key: "osc-bank",
    stage: "Oscillator",
    detail: "6x square, same fixed hex bank as the closed hat",
    parameter: "Frequencies",
    value: HEX_BANK_HZ,
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "filter",
    stage: "Filter",
    detail: "highpass, post-oscillator bank",
    parameter: "Cutoff (Tone)",
    value: `${v.tone} Hz`,
    live: true,
    control: "Tone knob (3000–10000 Hz)",
  },
  {
    key: "vca-peak",
    stage: "VCA (Amp Envelope)",
    detail: "instant attack, exponential decay",
    parameter: "Peak Level",
    value: v.muted ? "0% (muted)" : `${v.volume}%`,
    live: true,
    control: `Volume slider (${VOLUME_MIN}–${VOLUME_MAX}%)`,
  },
  {
    key: "vca-decay",
    stage: "VCA (Amp Envelope)",
    detail: "instant attack, exponential decay",
    parameter: 'Decay (the "ring")',
    value: `${v.decay.toFixed(2)}s`,
    live: true,
    control: "Decay knob (0.2–1s)",
  },
  {
    key: "pan",
    stage: "Pan",
    detail: "stereo panner, post-VCA",
    parameter: "Position",
    value: formatPan(v.pan),
    live: true,
    control: `Pan knob (${PANNING_L}–${PANNING_R})`,
  },
  masterEnvRow(),
];

/** Shared by HiTom/MidTom/LowTom — identical recipe, only the tuning/range constants differ. */
const tomRows = (
  v: { tone: number; decay: number; volume: number; pan: number; muted: boolean },
  toneMin: number,
  toneMax: number,
  decayMin: number,
  decayMax: number,
): VoiceParamRow[] => [
  {
    key: "osc-wave",
    stage: "Oscillator",
    detail: "1x sine, pitch envelope",
    parameter: "Waveform",
    value: "sine",
    live: false,
    control: "Fixed in code",
  },
  {
    key: "osc-start",
    stage: "Oscillator",
    detail: "1x sine, pitch envelope",
    parameter: "Start Freq",
    value: `${Math.round(v.tone * 1.15)} Hz`,
    live: true,
    control: "Fixed ratio (1.15x) of Tone knob",
  },
  {
    key: "osc-glide",
    stage: "Oscillator",
    detail: "1x sine, pitch envelope",
    parameter: "Glide Time",
    value: "25 ms",
    live: false,
    control: "Fixed in code",
  },
  {
    key: "osc-settle",
    stage: "Oscillator",
    detail: "1x sine, pitch envelope",
    parameter: "Settle Freq (Tone)",
    value: `${v.tone} Hz`,
    live: true,
    control: `Tone knob (${toneMin}–${toneMax} Hz)`,
  },
  {
    key: "filter-freq",
    stage: "Filter",
    detail: "bandpass, tuned to the fundamental",
    parameter: "Center Freq",
    value: `${v.tone} Hz`,
    live: true,
    control: "Tied to Tone knob (same value)",
  },
  {
    key: "filter-q",
    stage: "Filter",
    detail: "bandpass, tuned to the fundamental",
    parameter: "Q",
    value: "3",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "dist-amount",
    stage: "Distortion",
    detail: "Tone.Distortion, 2x oversample",
    parameter: "Amount",
    value: "0.04",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "dist-makeup",
    stage: "Distortion",
    detail: "Tone.Distortion, 2x oversample",
    parameter: "Makeup Gain",
    value: `${distortionMakeupGain(0.04).toFixed(2)}x`,
    live: false,
    control: "Derived from Amount",
  },
  {
    key: "vca-peak",
    stage: "VCA (Amp Envelope)",
    detail: "instant attack, exponential decay",
    parameter: "Peak Level",
    value: v.muted ? "0% (muted)" : `${v.volume}%`,
    live: true,
    control: `Volume slider (${VOLUME_MIN}–${VOLUME_MAX}%)`,
  },
  {
    key: "vca-decay",
    stage: "VCA (Amp Envelope)",
    detail: "instant attack, exponential decay",
    parameter: "Decay",
    value: `${v.decay.toFixed(2)}s`,
    live: true,
    control: `Decay knob (${decayMin}–${decayMax}s)`,
  },
  {
    key: "pan",
    stage: "Pan",
    detail: "stereo panner, post-VCA",
    parameter: "Position",
    value: formatPan(v.pan),
    live: true,
    control: `Pan knob (${PANNING_L}–${PANNING_R})`,
  },
  masterEnvRow(),
];

/**
 * Flattens the currently selected voice's `trigger()` recipe into one row
 * per parameter — live-knob-controlled or hardcoded — so it reads as a
 * signal-chain inventory: what it is, its current value, and whether it's
 * worth exposing as a new control or just hand-tuning in code. Dev tool for
 * {@link VoiceParamsTable}, not a user-facing feature.
 */
export const buildVoiceParamRows = (
  trackId: TrackId,
  voices: AllVoices,
): VoiceParamRow[] => {
  switch (trackId) {
    case "kick":
      return kickRows(voices.kick);
    case "kick2":
      return kick2Rows(voices.kick2);
    case "kickSauce":
      return kickSauceRows(voices.kickSauce);
    case "snare":
      return snareRows(voices.snare);
    case "hihat":
      return hihatRows(voices.hihat);
    case "hihatOpen":
      return hihatOpenRows(voices.hihatOpen);
    case "hiTom":
      return tomRows(
        voices.hiTom,
        HITOM_TONE_MIN,
        HITOM_TONE_MAX,
        HITOM_DECAY_MIN,
        HITOM_DECAY_MAX,
      );
    case "midTom":
      return tomRows(
        voices.midTom,
        MIDTOM_TONE_MIN,
        MIDTOM_TONE_MAX,
        MIDTOM_DECAY_MIN,
        MIDTOM_DECAY_MAX,
      );
    case "lowTom":
      return tomRows(
        voices.lowTom,
        LOWTOM_TONE_MIN,
        LOWTOM_TONE_MAX,
        LOWTOM_DECAY_MIN,
        LOWTOM_DECAY_MAX,
      );
  }
};
