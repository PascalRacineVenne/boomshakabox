import * as Tone from "tone";

export const startAudioContext = async (): Promise<void> => {
  const wasSuspended = Tone.getContext().state !== "running";
  await Tone.start();

  if (wasSuspended) {
    const warmupGain = new Tone.Gain(0.0001).toDestination();
    const warmupOsc = new Tone.Oscillator(440, "sine").connect(warmupGain);
    const now = Tone.now();
    warmupOsc.start(now);
    warmupOsc.stop(now + 0.05);

    setTimeout(() => {
      warmupOsc.dispose();
      warmupGain.dispose();
    }, 200);
  }
};
