import { Button } from "antd";
import * as Tone from "tone";

// Tone.Distortion's curve (from its source: (3+k)x*20deg / (PI+k|x|), where
// k = amount*100) isn't a soft-clipper like the raw version's tanh — it's a
// compressive curve that squashes full-scale input down hard (at x=1 it
// only outputs ~0.35 with amount=0.4). That's the "eaten low end": the
// fundamental's peak amplitude gets crushed by ~2.9x, not filtered.
// This computes exactly how much makeup gain restores that peak to unity.
function distortionMakeupGain(amount: number): number {
  const k = amount * 100;
  const deg = Math.PI / 180;
  const peakOutput = ((3 + k) * 20 * deg) / (Math.PI + k); // curve value at x=1
  return 1 / peakOutput;
}

// Same TR-808 kick recipe as WebAudioKickButton (a sine VCO with a fast
// downward pitch glide for the attack/punch, a short VCA decay, and a
// saturation stage for fatness), rebuilt with Tone.js. The one swap worth
// noting: Tone.Distortion replaces the raw version's hand-built
// WaveShaperNode curve — a different waveshaping algorithm under the hood,
// so its level-compensated with a makeup gain stage below (see
// distortionMakeupGain) instead of a Float32Array you compute yourself.
function ToneKickButton() {
  const triggerKick = async () => {
    // Unlocks/resumes Tone's shared AudioContext after the click gesture,
    // same role as audioCtx.resume() in the raw Web Audio version.
    await Tone.start();

    const now = Tone.now();
    const pitchDropTime = 0.05; // ~50ms glide — fast enough to read as a "click," not a siren
    const duration = 0.35; // short, punchy decay — fat but not a long boomy tail

    // VCO with a pitch envelope: starts bright, glides down to the sub fundamental
    const osc = new Tone.Oscillator(180, "sine");
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + pitchDropTime);

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
    ampGain.gain.setValueAtTime(1, now);
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

  return <Button onClick={triggerKick}>Trigger 808 Kick (Tone.js)</Button>;
}

export default ToneKickButton;
