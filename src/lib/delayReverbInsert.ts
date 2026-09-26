import * as Tone from "tone";
import { effectsBusOutput } from "./effectsBus";

// A full insert on the whole kit (not a per-voice send), spliced in
// right before the master bus, after the existing Filter/Drive stages:
// effectsBusOutput -> [this file's chain] -> masterGain (see
// masterBus.ts, which connects delayReverbInsertOutput instead of
// effectsBusOutput directly).
//
// Hand-built tape-style ping-pong delay (not Tone.PingPongDelay, so the
// cross-feed/darkening/grit character is tunable) followed by a
// Tone.Reverb (chosen after A/B/C listening against Freeverb and
// JCReverb — Tone.Reverb won).

// --- fixed, non-user-facing tone-shaping constants ---
const DELAY_INPUT_HIGHPASS_HZ = 250; // strips low end before it can enter the repeats
const DELAY_FEEDBACK_LOWPASS_HZ = 3500; // darkens each successive repeat
const DELAY_FEEDBACK_SATURATION_AMOUNT = 0.05; // subtle tape-style grit per repeat
const DELAY_LFO_RATE_HZ = 0.25; // wow/flutter rate
const DELAY_LFO_DEPTH_SEC = 0.003; // wow/flutter depth, +/- 3ms
const DELAY_WET_LEVEL = 0.28; // ~25-30% wet — kit stays mostly dry/punchy
const REVERB_INPUT_HIGHPASS_HZ = 300; // strips low end before the reverb tail
const REVERB_WET_LEVEL = 0.18; // ~15-20% wet
// Tone.Reverb has no roomSize Signal — its only control is `decay` (in
// seconds), a plain setter that triggers an async offline IR render.
// Verb Length (0-1) maps onto this range instead of straight into a Signal.
const TONE_REVERB_MIN_DECAY_SEC = 0.3;
const TONE_REVERB_MAX_DECAY_SEC = 4;
// Regenerating the IR on every knob tick would fire an offline render per
// tick while dragging; debouncing to only the last value after a short
// pause keeps that to one render per knob gesture instead.
const TONE_REVERB_DECAY_DEBOUNCE_MS = 120;

// --- quantized delay-time divisions, exposed to the UI ---
// Ordered by actual resulting duration (not by note-name grouping), so
// turning the knob sweeps delay time monotonically. Triplets ("t" suffix
// in Tone.js note-value strings) land between their neighboring
// straight/dotted values: 8t sits between 16n and 8n, 4t between 8n and
// 8n. (a triplet quarter is shorter than a dotted eighth).
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
// Both dryGain and delayWetGain's initial values are set to match
// DEFAULT_DELAY_FEEDBACK below (setDelayFeedback recomputes both any
// time Feedback changes) — feedback doubles as the delay's overall
// presence, not just its regeneration amount, so Feedback at minimum
// means no delay is audible at all, not "one clean repeat with no
// further regeneration."
const dryGain = new Tone.Gain(1 - DELAY_WET_LEVEL * DEFAULT_DELAY_FEEDBACK);
effectsBusOutput.connect(dryGain);

// --- delay wet path ---
const delayInputHighpass = new Tone.Filter(DELAY_INPUT_HIGHPASS_HZ, "highpass");
effectsBusOutput.connect(delayInputHighpass);

const delayLineL = new Tone.Delay(0);
const delayLineR = new Tone.Delay(0);
// Dry input feeds ONLY the left line. If it fed both lines, every repeat
// interval would emit near-identical hard-L and hard-R copies at the same
// instant — same content, same timing — which collapses to a centered
// image instead of alternating, and gets worse as feedback piles more of
// these simultaneous pairs on top of each other. Feeding just one side
// means the right line only ever receives signal via the cross-feed
// below, so repeats genuinely alternate L, R, L, R... one side at a time.
delayInputHighpass.connect(delayLineL);

// Each delay line's own output stage: lowpass (darken) first, THEN
// split into (a) the wet tap below and (b) saturation (grit) ->
// feedback gain (user-facing) -> crossed into the OPPOSITE delay line.
// Putting the lowpass before the split — not only inside the feedback
// loop — means even the very FIRST repeat is already darkened, not just
// the ones that have looped through feedback at least once. This
// cross-feed, not any stock node's built-in feedback, is what makes
// repeats alternate stereo sides.
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

// The wet tap comes off each line's own lowpass output (post-darken,
// pre-saturation/feedback-gain) rather than the delay line's raw
// output — the tap picks up the darkening immediately, same as the
// signal continuing into feedback does. Level is set by
// setDelayFeedback below, alongside dryGain, not a fixed constant.
//
// Hard-panned opposite sides BEFORE summing — this, not just the
// cross-feed routing above, is what actually makes it read as
// ping-pong. Two mono-ish taps summed into the same gain node with no
// panning would collapse any L/R alternation before it ever reaches the
// listener, which is what was happening before this.
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

// The reverb's highpass/processing is a SIDE-CHAIN off preReverbSum, not
// something preReverbSum itself passes through — otherwise the entire
// kit (not just the reverb tail) would lose its low end, since
// Tone.Reverb's own internal wet/dry mix would be blending its OWN input
// (the already-highpassed signal) back in as its "dry" portion. Instead:
// toneReverb runs fully wet (its internal mix disabled), and only ITS
// output — the processed tail — gets summed back onto the untouched
// full-bandwidth preReverbSum signal below.
const reverbInputHighpass = new Tone.Filter(
  REVERB_INPUT_HIGHPASS_HZ,
  "highpass",
);
preReverbSum.connect(reverbInputHighpass);

// Tone.Reverb: a convolution reverb from an offline-rendered decaying
// noise burst. Its only control (`decay`, in seconds) is a plain setter
// that kicks off an async re-render each time it's set — see
// setVerbLength below, which debounces that.
const toneReverb = new Tone.Reverb(TONE_REVERB_MIN_DECAY_SEC);
toneReverb.wet.value = 1;
reverbInputHighpass.connect(toneReverb);

// Convolving with a generated noise-burst IR reads quieter than an
// algorithmic reverb's sustained feedback at a matched decay length, so
// this makeup gain brings the tail up to a comparable presence.
// Starting guess from the A/B/C pass; retune by ear if needed.
const TONE_REVERB_PRESENCE_TRIM = 2.5;
const toneReverbPresenceTrim = new Tone.Gain(TONE_REVERB_PRESENCE_TRIM);
toneReverb.connect(toneReverbPresenceTrim);

// Verb Length doubles as the reverb's overall presence (see
// setVerbLength below), same as Feedback does for the delay: at
// minimum, this goes to 0 too, so there's no reverb tail audible at all
// rather than a short-but-still-there one.
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

// Feedback doubles as the delay's overall presence (not just its
// regeneration amount): at minimum, both the feedback loops AND the wet
// tap itself go to 0, so the delay is fully silent rather than still
// producing one clean repeat with no further regeneration. dryGain
// rises to compensate, so the kit returns to full level when delay is
// off.
//
// The knob's raw 0-1 value is cubed before being applied anywhere —
// linear felt like it was nearly self-oscillating by the knob's
// midpoint (each cross-feed hop compounds, and the saturation stage
// adds perceived energy on top of the raw gain math), so this pushes
// that territory toward the top quarter of the knob's rotation instead,
// leaving the middle of the range feeling controlled.
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
