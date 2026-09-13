import { useState } from "react";
import { Button, Knob, Slider } from "@cutoff/audio-ui-react";
import * as Tone from "tone";
import { controlPanelStyles } from "./ControlPanel";

/**
 * `Tone.Distortion`'s curve (from its source: `(3+k)x*20deg / (PI+k|x|)`,
 * where `k = amount*100`) isn't a soft-clipper like the raw version's
 * tanh — it's a compressive curve that squashes full-scale input down
 * hard (at x=1 it only outputs ~0.35 with amount=0.4). That's the "eaten
 * low end": the fundamental's peak amplitude gets crushed by ~2.9x, not
 * filtered.
 *
 * @param amount - The `Tone.Distortion` `distortion` amount (0-1) this
 * makeup gain is compensating for.
 * @returns The linear gain multiplier that restores the curve's peak
 * output back to unity.
 */
const distortionMakeupGain = (amount: number): number => {
  const k = amount * 100;
  const deg = Math.PI / 180;
  const peakOutput = ((3 + k) * 20 * deg) / (Math.PI + k); // curve value at x=1
  return 1 / peakOutput;
};

const PITCH_DROP_START = 180; // starting "click" pitch the VCO glides down from, in Hz

/**
 * TR-808 kick recipe (a sine VCO with a fast
 * downward pitch glide for the attack/punch, a short VCA decay, and a
 * saturation stage for fatness), built with Tone.js. The one swap worth
 * noting: `Tone.Distortion` replaces the raw version's hand-built
 * `WaveShaperNode` curve — a different waveshaping algorithm under the
 * hood, so it's level-compensated with a makeup gain stage below (see
 * {@link distortionMakeupGain}) instead of a `Float32Array` you compute
 * yourself.
 *
 * Per ui-stack.md's per-track strip mapping, Volume is the shared-base
 * Slider and "Tone"/"Decay" are the kick's instrument-specific Knobs. This
 * is a one-shot preview button, not a persistent scheduled voice, so
 * there's no live Tone node to write control changes into mid-sound (see
 * drum-machine-architecture.md's one-shot vs. sustained classification) —
 * plain `useState` is enough, read fresh at the top of `triggerKick` on
 * every click.
 */
const ToneKickButton = () => {
  const [tone, setTone] = useState(50); // resting fundamental frequency the pitch glide settles on, in Hz
  const [decay, setDecay] = useState(0.35); // amp envelope decay length, in seconds
  const [volume, setVolume] = useState(75); // 0-100%, overall output level
  const [pressed, setPressed] = useState(false); // drives the pad's lit state — real mousedown/up, not hover

  const triggerKick = async () => {
    // Unlocks/resumes Tone's shared AudioContext after the click gesture,
    // same role as audioCtx.resume() in the raw Web Audio version.
    await Tone.start();

    const now = Tone.now();
    const pitchDropTime = 0.05; // ~50ms glide — fast enough to read as a "click," not a siren
    const duration = decay; // "Decay" knob: short, punchy decay — fat but not a long boomy tail
    const level = volume / 100; // Volume slider as a 0-1 multiplier applied to the VCA peak

    // VCO with a pitch envelope: starts bright, glides down to the sub fundamental
    const osc = new Tone.Oscillator(PITCH_DROP_START, "sine");
    osc.frequency.exponentialRampToValueAtTime(tone, now + pitchDropTime); // "Tone" knob: the pitch it settles on

    // Saturation stage (Drive knob): Tone.Distortion is a prebuilt
    // WaveShaper wrapper — the "0.4" is the same kind of drive amount as
    // the raw version's hand-computed tanh curve.
    const distortionAmount = 0.1;
    const saturation = new Tone.Distortion(distortionAmount);
    saturation.oversample = "4x";

    // Output/makeup gain (the "Output" knob you'd find after a drive stage
    // on real distortion gear): restores the peak level the Distortion
    // curve crushed, so the drive adds harmonics without also quietly
    // thinning out the kick.
    const makeupGain = new Tone.Gain(distortionMakeupGain(distortionAmount));

    // VCA: instant attack, no ramp-up, exponential decay curve
    const ampGain = new Tone.Gain(1).toDestination();
    ampGain.gain.setValueAtTime(level, now); // "Volume" slider sets the peak level
    ampGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(saturation); // VCO -> Drive
    saturation.connect(makeupGain); // Drive -> Output trim
    makeupGain.connect(ampGain); // Output trim -> VCA
    osc.start(now);
    osc.stop(now + duration);

    // Tone.js nodes need an explicit .dispose() once their sound has
    // finished, unlike a disconnected raw OscillatorNode which is
    // garbage-collected on its own.
    setTimeout(
      () => {
        osc.dispose();
        saturation.dispose();
        makeupGain.dispose();
        ampGain.dispose();
      },
      (duration + 0.1) * 1000,
    );
  };

  return (
    <div className={controlPanelStyles.panel}>
      <div className={controlPanelStyles.controlsRow}>
        <Slider
          min={0}
          max={100}
          step={1}
          value={volume}
          onChange={(e) => setVolume(e.value)}
          label="Volume"
          orientation="vertical"
          unit="%"
          valueAsLabel="interactive"
        />
        <div className={controlPanelStyles.knobColumn}>
          <Knob
            min={30}
            max={120}
            value={tone}
            onChange={(e) => setTone(e.value)}
            label="Tone"
          />
          <Knob
            min={0.1}
            max={1}
            value={decay}
            onChange={(e) => setDecay(e.value)}
            label="Decay"
          />
        </div>
      </div>
      <Button
        label="Kick"
        value={pressed}
        onChange={(e) => {
          setPressed(e.value);
          if (e.value) triggerKick(); // fires on the real press, not on the release toggling back to false
        }}
      />
    </div>
  );
};

export default ToneKickButton;
