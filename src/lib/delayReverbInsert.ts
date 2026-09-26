import * as Tone from "tone";
import { effectsBusOutput } from "./effectsBus";

// Full-kit insert between the effects bus and the master gain. See
// DOCS/buses/delay-reverb-insert.md for the full signal-flow diagram and
// design rationale.

// --- fixed, non-user-facing tone-shaping constants ---
const DELAY_INPUT_HIGHPASS_HZ = 250; // strips low end before it can enter the repeats
const DELAY_FEEDBACK_LOWPASS_HZ = 3500; // darkens each successive repeat
const DELAY_FEEDBACK_SATURATION_AMOUNT = 0.05; // subtle tape-style grit per repeat
const DELAY_LFO_RATE_HZ = 0.25; // wow/flutter rate
const DELAY_LFO_DEPTH_SEC = 0.003; // wow/flutter depth, +/- 3ms
const DELAY_WET_LEVEL = 0.28; // ~25-30% wet — kit stays mostly dry/punchy
const REVERB_INPUT_HIGHPASS_HZ = 300; // strips low end before the reverb tail
const REVERB_WET_LEVEL = 0.18; // ~15-20% wet
// Verb Length (0-1) maps onto Tone.Reverb's decay range (seconds) — see
// bus doc for why this can't be a live-rampable Signal like Freeverb's.
const TONE_REVERB_MIN_DECAY_SEC = 0.3;
const TONE_REVERB_MAX_DECAY_SEC = 4;
const TONE_REVERB_DECAY_DEBOUNCE_MS = 120;

// --- quantized delay-time divisions, exposed to the UI ---
// Ordered by actual resulting duration, not note-name grouping — see bus
// doc for why triplets land where they do in this list.
export const DELAY_TIME_DIVISIONS = [
  "16n",
  "8t",
  "8n",
  "4t",
  "8n.",
  "4n",
  "4n.",
  "2n",
] as const;
export const DELAY_TIME_LABELS = [
  "1/16",
  "1/8t",
  "1/8",
  "1/4t",
  "1/8.",
  "1/4",
  "1/4.",
  "1/2",
] as const;

// --- user-facing defaults ---
export const DEFAULT_DELAY_TIME_INDEX = 2; // "8n"
export const DEFAULT_DELAY_FEEDBACK = 0;
export const DEFAULT_VERB_LENGTH = 0;

// --- dry path: the original post-Drive signal, mostly untouched ---
// Initial value matches DEFAULT_DELAY_FEEDBACK; setDelayFeedback below
// recomputes both this and delayWetGain together — see bus doc for why
// Feedback doubles as the delay's overall presence.
const dryGain = new Tone.Gain(1 - DELAY_WET_LEVEL * DEFAULT_DELAY_FEEDBACK);
effectsBusOutput.connect(dryGain);

// --- delay wet path ---
const delayInputHighpass = new Tone.Filter(DELAY_INPUT_HIGHPASS_HZ, "highpass");
effectsBusOutput.connect(delayInputHighpass);

const delayLineL = new Tone.Delay(0);
const delayLineR = new Tone.Delay(0);
// Dry input feeds ONLY the left line — see bus doc for why (feeding both
// would collapse the ping-pong effect to a centered image).
delayInputHighpass.connect(delayLineL);

// Each delay line's own output stage: lowpass (darken) first, THEN split
// into (a) the wet tap below and (b) saturation -> feedback gain -> the
// OPPOSITE delay line. Lowpass before the split means even the first
// repeat is darkened — see bus doc.
const buildDelayOutputStage = () => {
  const lowpass = new Tone.Filter(DELAY_FEEDBACK_LOWPASS_HZ, "lowpass");
  const saturation = new Tone.Distortion(DELAY_FEEDBACK_SATURATION_AMOUNT);
  const feedbackGain = new Tone.Gain(DEFAULT_DELAY_FEEDBACK);
  lowpass.connect(saturation);
  saturation.connect(feedbackGain);
  return { lowpass, feedbackGain };
};

const outputL = buildDelayOutputStage(); // L's repeats feed into R
const outputR = buildDelayOutputStage(); // R's repeats feed into L
delayLineL.connect(outputL.lowpass);
outputL.feedbackGain.connect(delayLineR);
delayLineR.connect(outputR.lowpass);
outputR.feedbackGain.connect(delayLineL);

// Wow/flutter: a slow LFO summed on top of each delay line's own
// delayTime (Param modulation is additive, not replacing), so both
// lines wobble slightly around whatever time is currently set.
const delayLfo = new Tone.LFO({
  frequency: DELAY_LFO_RATE_HZ,
  min: -DELAY_LFO_DEPTH_SEC,
  max: DELAY_LFO_DEPTH_SEC,
}).start();
delayLfo.connect(delayLineL.delayTime);
delayLfo.connect(delayLineR.delayTime);

// The wet tap comes off each line's own lowpass output (post-darken).
// Hard-panned opposite sides BEFORE summing — necessary in addition to
// the cross-feed above for this to read as ping-pong; see bus doc.
const delayPannerL = new Tone.Panner(-1);
const delayPannerR = new Tone.Panner(1);
outputL.lowpass.connect(delayPannerL);
outputR.lowpass.connect(delayPannerR);

const delayWetGain = new Tone.Gain(DELAY_WET_LEVEL * DEFAULT_DELAY_FEEDBACK);
delayPannerL.connect(delayWetGain);
delayPannerR.connect(delayWetGain);

// --- sum dry + delay-wet: this is the full-bandwidth signal ---
const preReverbSum = new Tone.Gain(1);
dryGain.connect(preReverbSum);
delayWetGain.connect(preReverbSum);

// The reverb is a SIDE-CHAIN off preReverbSum, not something it passes
// through — otherwise the whole kit, not just the tail, would lose its
// low end. See bus doc for the full reasoning.
const reverbInputHighpass = new Tone.Filter(
  REVERB_INPUT_HIGHPASS_HZ,
  "highpass",
);
preReverbSum.connect(reverbInputHighpass);

// Tone.Reverb: convolution reverb from an offline-rendered noise burst.
const toneReverb = new Tone.Reverb(TONE_REVERB_MIN_DECAY_SEC);
toneReverb.wet.value = 1;
reverbInputHighpass.connect(toneReverb);

// Makeup gain — Tone.Reverb reads quieter than an algorithmic reverb at a
// matched decay length. Starting guess from the A/B/C pass; see bus doc.
const TONE_REVERB_PRESENCE_TRIM = 2.5;
const toneReverbPresenceTrim = new Tone.Gain(TONE_REVERB_PRESENCE_TRIM);
toneReverb.connect(toneReverbPresenceTrim);

// Verb Length doubles as the reverb's overall presence, same as Feedback
// does for the delay — see bus doc.
const reverbWetGain = new Tone.Gain(REVERB_WET_LEVEL * DEFAULT_VERB_LENGTH);
toneReverbPresenceTrim.connect(reverbWetGain);

const insertOutputSum = new Tone.Gain(1);
preReverbSum.connect(insertOutputSum); // full-bandwidth, untouched
reverbWetGain.connect(insertOutputSum); // just the reverb tail, on top

export const delayReverbInsertOutput = insertOutputSum;

// --- user-facing controls ---

let currentDelayTimeIndex = DEFAULT_DELAY_TIME_INDEX;

// Tone.Time("8n") resolves against the transport's BPM only at the
// moment it's called — it does not keep re-resolving on its own if BPM
// changes later. This is called again below whenever BPM changes.
const applyDelayTimeDivision = (index: number) => {
  const division = DELAY_TIME_DIVISIONS[index];
  const seconds = Tone.Time(division).toSeconds();
  delayLineL.delayTime.rampTo(seconds, 0.05);
  delayLineR.delayTime.rampTo(seconds, 0.05);
};

export const setDelayTimeDivision = (index: number) => {
  currentDelayTimeIndex = index;
  applyDelayTimeDivision(index);
};

// Feedback doubles as the delay's overall presence, and its raw 0-1 value
// is curved (currently exponent 1, i.e. linear — was cubed during initial
// tuning) before being applied anywhere. See bus doc for both.
const FEEDBACK_CURVE_EXPONENT = 1;
export const setDelayFeedback = (value: number) => {
  const curved = value ** FEEDBACK_CURVE_EXPONENT;
  outputL.feedbackGain.gain.rampTo(curved, 0.02);
  outputR.feedbackGain.gain.rampTo(curved, 0.02);
  delayWetGain.gain.rampTo(DELAY_WET_LEVEL * curved, 0.02);
  dryGain.gain.rampTo(1 - DELAY_WET_LEVEL * curved, 0.02);
};

let toneReverbDecayTimeout: ReturnType<typeof setTimeout> | null = null;

export const setVerbLength = (value: number) => {
  reverbWetGain.gain.rampTo(REVERB_WET_LEVEL * value, 0.02);

  if (toneReverbDecayTimeout !== null) clearTimeout(toneReverbDecayTimeout);
  toneReverbDecayTimeout = setTimeout(() => {
    toneReverb.decay =
      TONE_REVERB_MIN_DECAY_SEC +
      (TONE_REVERB_MAX_DECAY_SEC - TONE_REVERB_MIN_DECAY_SEC) * value;
  }, TONE_REVERB_DECAY_DEBOUNCE_MS);
};

applyDelayTimeDivision(DEFAULT_DELAY_TIME_INDEX);

// Tone.js's bpm Param has no change event to subscribe to, so this polls
// for changes instead (the tempo knob elsewhere ramps bpm over 20ms, so
// a 150ms poll comfortably catches the settled new value) and
// re-resolves the current quantized division against the new tempo.
const POLL_INTERVAL_MS = 150;
let lastBpm = Tone.getTransport().bpm.value;
setInterval(() => {
  const bpm = Tone.getTransport().bpm.value;
  if (bpm !== lastBpm) {
    lastBpm = bpm;
    applyDelayTimeDivision(currentDelayTimeIndex);
  }
}, POLL_INTERVAL_MS);
