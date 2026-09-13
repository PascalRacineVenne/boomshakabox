import { Button } from "antd";
import * as Tone from "tone";

// Same TR-808 snare recipe as WebAudioSnareButton (two triangle VCOs for the
// "Tone" voice, highpass-filtered noise for the "Snap" voice), rebuilt with
// Tone.js's higher-level nodes instead of raw Web Audio nodes. Compare the
// two components node-by-node — Tone.Gain/.Oscillator/.Filter/.Noise are
// thin wrappers over the exact same native GainNode/OscillatorNode/
// BiquadFilterNode, plus a couple of Tone.js-specific conveniences noted
// below.
function ToneSnareButton() {
  const triggerSnare = async () => {
    // Tone.js shares one AudioContext under the hood (Tone.getContext()).
    // Tone.start() is the equivalent of audioCtx.resume() in the raw
    // Web Audio version — browsers require a user gesture before audio
    // will actually play, and this call unlocks/resumes that shared context.
    await Tone.start();

    // Tone.now() reads the same underlying AudioContext.currentTime as the
    // raw version's "now" — it's the trigger instant everything below is
    // scheduled relative to.
    const now = Tone.now();
    const duration = 0.2; // ~200ms, matching the 808's fixed snare decay

    // --- Tone voice: two VCOs summed into one VCA ---
    // Tone.Gain wraps a native GainNode; its .gain param exposes the exact
    // same setValueAtTime/exponentialRampToValueAtTime automation API as
    // raw Web Audio's AudioParam.
    const toneGain = new Tone.Gain(1).toDestination(); // VCA for the tone voice, wired straight to the master bus
    toneGain.gain.setValueAtTime(0.7, now); // instant attack, no ramp-up — drums are all decay
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + duration); // capacitor-discharge-style decay curve

    const oscillators = [180, 330].map((freq) => {
      const osc = new Tone.Oscillator(freq, "triangle").connect(toneGain); // VCO -> VCA
      osc.start(now); // gate on
      osc.stop(now + duration); // gate off once the decay tail is inaudible
      return osc;
    });

    // --- Snap voice: noise source -> filter (VCF) -> its own VCA/EG ---
    // Tone.Noise is a built-in noise generator — unlike raw Web Audio,
    // there's no need to hand-fill an AudioBuffer with Math.random() samples.
    const noiseFilter = new Tone.Filter(1000, "highpass"); // the VCF shaping noise into the "snap"
    // noiseFilter.channelCount = 1;    // the 808's noise circuit is mono, not stereo
    // noiseFilter.channelCountMode = "explicit";   // don't let the VCF auto-upmix to stereo
    const noiseGain = new Tone.Gain(1).toDestination(); // second, independent VCA/EG — the 808's separate "Snap" decay
    noiseGain.gain.setValueAtTime(1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const noise = new Tone.Noise("white").connect(noiseFilter); // noise -> VCF
    noiseFilter.connect(noiseGain); // VCF -> VCA
    noise.start(now);
    noise.stop(now + duration);

    // Tone.js nodes wrap native nodes but aren't garbage-collected on their
    // own the way a disconnected raw OscillatorNode is — each one needs an
    // explicit .dispose() once its sound has finished, or repeated triggers
    // leak nodes. This has no equivalent step in the raw Web Audio version.
    setTimeout(
      () => {
        oscillators.forEach((osc) => osc.dispose());
        toneGain.dispose();
        noise.dispose();
        noiseFilter.dispose();
        noiseGain.dispose();
      },
      (duration + 0.1) * 1000,
    );
  };

  return <Button onClick={triggerSnare}>Trigger 808 Snare (Tone.js)</Button>;
}

export default ToneSnareButton;
