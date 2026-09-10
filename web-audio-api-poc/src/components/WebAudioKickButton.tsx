import { useRef } from "react";
import { Button } from "antd";

// Builds a soft-clip transfer curve for a WaveShaperNode — the "Drive"/
// "Saturation" knob. tanh-shaping pushes the waveform's peaks toward +-1,
// adding harmonics (fattening the sound) without hard-clipping it.
function makeSaturationCurve(amount: number): Float32Array<ArrayBuffer> {
  const samples = 44100;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = Math.tanh(amount * x);
  }
  return curve;
}

// The real TR-808 kick is a single VCO (sine core) whose pitch glides
// quickly downward right after the trigger — that fast pitch drop *is*
// the kick's "attack"/punch, there's no separate click/noise layer like
// the snare uses. A VCA then shapes a short, punchy decay, and a touch of
// saturation fattens the low end so it still reads on small speakers.
function WebAudioKickButton() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const triggerKick = () => {
    const audioCtx = audioCtxRef.current ?? new AudioContext();
    audioCtxRef.current = audioCtx;
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const pitchDropTime = 0.05; // ~50ms glide — fast enough to read as a "click," not a siren
    const duration = 0.35; // short, punchy decay — fat but not a long boomy tail

    // VCO with a pitch envelope: starts bright, glides down to the sub fundamental
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, now); // starting pitch: gives the transient its "click"
    osc.frequency.exponentialRampToValueAtTime(50, now + pitchDropTime); // glide down to the felt sub-bass tone

    // Saturation stage (Drive knob): adds harmonics so the kick has body
    // beyond just sub-bass energy — this is the "fat" part of the brief.
    const saturation = audioCtx.createWaveShaper();
    saturation.curve = makeSaturationCurve(4);
    saturation.oversample = "4x"; // reduces aliasing artifacts from the clipping

    // VCA: instant attack, no ramp-up (drums are all decay), exponential decay curve
    const ampGain = audioCtx.createGain();
    ampGain.gain.setValueAtTime(1, now);
    ampGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(saturation); // VCO -> Drive
    saturation.connect(ampGain); // Drive -> VCA
    // osc.connect(ampGain); // VCO -> VCA (no saturation stage for now, just the raw sine)
    ampGain.connect(audioCtx.destination); // VCA -> mix bus

    osc.start(now);
    osc.stop(now + duration);
  };

  return (
    <Button onClick={triggerKick}>Trigger 808 Kick (Web Audio API)</Button>
  );
}

export default WebAudioKickButton;
