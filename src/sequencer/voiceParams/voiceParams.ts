import {
  PANNING_L,
  PANNING_R,
  VOLUME_MAX,
  VOLUME_MIN,
  formatPan,
} from "../../components/shared/ControlPanel";
import { distortionMakeupGain } from "../../lib/distortionMakeupGain";
import { HI_HAT_OSCILLATOR_FREQUENCIES } from "../../lib/hiHatOscillatorFrequencies";

import {
  KICK_CLICK_MAX,
  KICK_CLICK_MIN,
  KICK_FATNESS_MAX,
  KICK_FATNESS_MIN,
  KICK_LENGTH_MAX,
  KICK_LENGTH_MIN,
  KICK_PITCH_MAX,
  KICK_PITCH_MIN,
  KICK_PUNCH_MAX,
  KICK_PUNCH_MIN,
  useKickVoice,
} from "../../components/voices/kick/useKickVoice";
import {
  SNARE_DECAY_MAX,
  SNARE_DECAY_MIN,
  SNARE_SNAPPY_MAX,
  SNARE_SNAPPY_MIN,
  SNARE_TONE_MAX,
  SNARE_TONE_MIN,
  useSnareVoice,
} from "../../components/voices/snare/useSnareVoice";
import {
  CLAP_DECAY_MAX,
  CLAP_DECAY_MIN,
  CLAP_FATNESS_MAX,
  CLAP_FATNESS_MIN,
  CLAP_PUNCH_MAX,
  CLAP_PUNCH_MIN,
  CLAP_SNAP_MAX,
  CLAP_SNAP_MIN,
  CLAP_TONE_MAX,
  CLAP_TONE_MIN,
  useClapVoice,
} from "../../components/voices/clap/useClapVoice";
import {
  HH_TONE_MAX,
  HH_TONE_MIN,
  useHiHatVoice,
} from "../../components/voices/hiHat/useHiHatVoice";
import { useHiHatOpenVoice } from "../../components/voices/hiHatOpen/useHiHatOpenVoice";
import {
  DECAY_MAX as HITOM_DECAY_MAX,
  DECAY_MIN as HITOM_DECAY_MIN,
  TONE_MAX as HITOM_TONE_MAX,
  TONE_MIN as HITOM_TONE_MIN,
  useHiTomVoice,
} from "../../components/voices/hiTom/useHiTomVoice";
import {
  DECAY_MAX as MIDTOM_DECAY_MAX,
  DECAY_MIN as MIDTOM_DECAY_MIN,
  TONE_MAX as MIDTOM_TONE_MAX,
  TONE_MIN as MIDTOM_TONE_MIN,
  useMidTomVoice,
} from "../../components/voices/midTom/useMidTomVoice";
import {
  DECAY_MAX as LOWTOM_DECAY_MAX,
  DECAY_MIN as LOWTOM_DECAY_MIN,
  TONE_MAX as LOWTOM_TONE_MAX,
  TONE_MIN as LOWTOM_TONE_MIN,
  useLowTomVoice,
} from "../../components/voices/lowTom/useLowTomVoice";

import type { TrackId } from "../grid/useStepSequencer";

export interface AllVoices {
  kick: ReturnType<typeof useKickVoice>;
  snare: ReturnType<typeof useSnareVoice>;
  clap: ReturnType<typeof useClapVoice>;
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
    key: "membrane-wave",
    stage: "MembraneSynth (body)",
    detail: "Tone.MembraneSynth, built fresh per hit",
    parameter: "Waveform",
    value: "sine",
    live: false,
    control: "Fixed in code",
  },
  {
    key: "membrane-punch",
    stage: "MembraneSynth (body)",
    detail: "Tone.MembraneSynth, built fresh per hit",
    parameter: "Octaves (Punch)",
    value: `${v.punch}`,
    live: true,
    control: `Punch knob (${KICK_PUNCH_MIN}–${KICK_PUNCH_MAX})`,
  },
  {
    key: "membrane-pitchdecay",
    stage: "MembraneSynth (body)",
    detail: "Tone.MembraneSynth, built fresh per hit",
    parameter: "Pitch Decay",
    value: "35 ms",
    live: false,
    control: "Fixed in code",
  },
  {
    key: "membrane-note",
    stage: "MembraneSynth (body)",
    detail: "Tone.MembraneSynth, built fresh per hit",
    parameter: "Note (Pitch)",
    value: `${v.pitch} Hz`,
    live: true,
    control: `Pitch knob (${KICK_PITCH_MIN}–${KICK_PITCH_MAX} Hz)`,
  },
  {
    key: "membrane-decay",
    stage: "MembraneSynth (body)",
    detail: "Tone.MembraneSynth, built fresh per hit",
    parameter: "Envelope Decay (Length)",
    value: `${v.length.toFixed(2)}s`,
    live: true,
    control: `Length knob (${KICK_LENGTH_MIN}–${KICK_LENGTH_MAX}s)`,
  },
  {
    key: "dist-amount",
    stage: "Distortion",
    detail: "Tone.Distortion, 4x oversample",
    parameter: "Amount (Fatness)",
    value: `${v.fatness}`,
    live: true,
    control: `Fatness knob (${KICK_FATNESS_MIN}–${KICK_FATNESS_MAX})`,
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
    detail:
      "bandpass on NoiseSynth, bypasses Distortion/lowpass/makeup/highpass",
    parameter: "Cutoff",
    value: "3200 Hz",
    live: false,
    control: "Fixed in code — not exposed",
  },
  {
    key: "click-filter-q",
    stage: "Filter (Click layer)",
    detail:
      "bandpass on NoiseSynth, bypasses Distortion/lowpass/makeup/highpass",
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
    control: `Click knob (${KICK_CLICK_MIN}–${KICK_CLICK_MAX})`,
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

const SNARE_TONE_RATIO = 330 / 180;

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
    value: `${v.decay.toFixed(2)}s`,
    live: true,
    control: `Decay knob (${SNARE_DECAY_MIN}–${SNARE_DECAY_MAX}s)`,
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
    value: `${v.decay.toFixed(2)}s`,
    live: true,
    control: `Decay knob (${SNARE_DECAY_MIN}–${SNARE_DECAY_MAX}s) — same value as Tone voice's decay`,
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

const clapRows = (v: AllVoices["clap"]): VoiceParamRow[] => [
  {
    key: "noise-source",
    stage: "Noise",
    detail: "white noise, feeds both the tail and burst paths",
    parameter: "Type",
    value: "white",
    live: false,
    control: "Fixed in code",
  },
  {
    key: "bandpass-freq",
    stage: "Filter",
    detail: "bandpass, shared by tail and burst paths",
    parameter: "Cutoff (Tone)",
    value: `${v.tone} Hz`,
    live: true,
    control: `Tone knob (${CLAP_TONE_MIN}–${CLAP_TONE_MAX} Hz)`,
  },
  {
    key: "bandpass-q",
    stage: "Filter",
    detail: "bandpass, shared by tail and burst paths",
    parameter: "Q (Punch)",
    value: `${v.punch}`,
    live: true,
    control: `Punch knob (${CLAP_PUNCH_MIN}–${CLAP_PUNCH_MAX})`,
  },
  {
    key: "tail-vca-decay",
    stage: "VCA (Tail path)",
    detail: 'single exponential decay — the "room" ring-out',
    parameter: "Decay",
    value: `${v.decay.toFixed(2)}s`,
    live: true,
    control: `Decay knob (${CLAP_DECAY_MIN}–${CLAP_DECAY_MAX}s)`,
  },
  {
    key: "burst-pulse-count",
    stage: "VCA (Burst path)",
    detail: "5 short pulses, chaotic timing/amplitude on the first two",
    parameter: "Pulse Count",
    value: "5",
    live: false,
    control: "Fixed in code",
  },
  {
    key: "burst-spacing",
    stage: "VCA (Burst path)",
    detail: "5 short pulses, chaotic timing/amplitude on the first two",
    parameter: "Pulse Spacing (Snap)",
    value: `${v.snap}`,
    live: true,
    control: `Snap knob (${CLAP_SNAP_MIN}–${CLAP_SNAP_MAX}, higher = tighter)`,
  },
  {
    key: "fold-amount",
    stage: "Distortion",
    detail: "Tone.Distortion (wavefold), 4x oversample — burst path only",
    parameter: "Amount (Fatness)",
    value: `${v.fatness}`,
    live: true,
    control: `Fatness knob (${CLAP_FATNESS_MIN}–${CLAP_FATNESS_MAX})`,
  },
  {
    key: "lowpass",
    stage: "Filter",
    detail: "lowpass, post-sum of tail and burst paths",
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
    detail: "same settings as Kick's output stage",
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
    detail: "stereo panner, shared by both paths",
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

const tomRows = (
  v: {
    tone: number;
    decay: number;
    volume: number;
    pan: number;
    muted: boolean;
  },
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

export const buildVoiceParamRows = (
  trackId: TrackId,
  voices: AllVoices,
): VoiceParamRow[] => {
  switch (trackId) {
    case "kick":
      return kickRows(voices.kick);
    case "snare":
      return snareRows(voices.snare);
    case "clap":
      return clapRows(voices.clap);
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
