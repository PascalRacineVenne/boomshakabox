import { useRef } from "react";
import { Button } from "antd";

/**
 * The real TR-808 snare is two analog voices summed on the mix bus: a
 * "Tone" voice (two VCOs -> VCA -> fast decay EG) and a "Snap" voice
 * (noise diode -> VCF -> VCA -> slightly longer decay EG). We rebuild
 * both voices with raw Web Audio API nodes and mix them the same way.
 */
const WebAudioSnareButton = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const triggerSnare = () => {
    // AudioContext is the whole synth's power/clock domain — every node
    // below only exists relative to it, like every stage of the 808
    // hangs off the same master clock and power rail.
    const audioCtx = audioCtxRef.current ?? new AudioContext();
    audioCtxRef.current = audioCtx;
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    // "now" is the trigger instant — the moment a pad hit or step pulse
    // fires the envelope generators downstream.
    const now = audioCtx.currentTime;
    const duration = 0.2; // ~200ms, matching the 808's fixed (non-adjustable) snare decay

    // --- Tone voice: two VCOs tuned close together (like the 808's shared
    // oscillator core), summed and run through one VCA ---
    const toneGain = audioCtx.createGain(); // the VCA for the tone voice
    toneGain.gain.setValueAtTime(0.7, now); // envelope attack: instantly open, no ramp-up (drums are all decay, no attack stage)
    // exponential ramp = the capacitor-discharge curve of an analog decay EG, not a linear fade
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    toneGain.connect(audioCtx.destination); // into the mix bus

    [180, 330].forEach((freq) => {
      const osc = audioCtx.createOscillator(); // one VCO
      osc.type = "triangle"; // closest built-in waveform to the 808's VCO core shape
      osc.frequency.setValueAtTime(freq, now); // no pitch envelope — the 808 tone voice doesn't sweep, it just decays
      osc.connect(toneGain); // VCO -> VCA
      osc.start(now); // gate on
      osc.stop(now + duration); // gate off once the decay tail is inaudible
    });

    // --- Snap voice: noise source -> filter (VCF) -> its own VCA/EG ---
    // The 808 generates noise from a reverse-biased transistor junction;
    // digitally we fill a buffer with random samples instead.
    const bufferSize = Math.floor(audioCtx.sampleRate * duration);
    const noiseBuffer = audioCtx.createBuffer(
      1,
      bufferSize,
      audioCtx.sampleRate,
    );
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // white noise: every sample independent, no dominant pitch
    }

    const noiseSource = audioCtx.createBufferSource(); // playback head for the noise buffer, stands in for the noise circuit
    noiseSource.buffer = noiseBuffer;

    // The VCF: a real 808 highpasses the noise so the snap sits above the
    // tone voice instead of muddying it — this is the "Snap"/tone-color
    // control on the front panel.
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.setValueAtTime(1000, now);

    // A second, independent VCA/EG — on the real unit this is the "Snap"
    // decay, tuned separately from the "Tone" decay above.
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseSource.connect(noiseFilter); // noise -> VCF
    noiseFilter.connect(noiseGain); // VCF -> VCA
    noiseGain.connect(audioCtx.destination); // into the same mix bus as the tone voice
    noiseSource.start(now);
  };

  return (
    <Button onClick={triggerSnare}>Trigger 808 Snare (Web Audio API)</Button>
  );
};

export default WebAudioSnareButton;
