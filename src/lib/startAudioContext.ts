import * as Tone from "tone";

/**
 * Unlocks/resumes Tone's shared `AudioContext` in response to a user
 * gesture (required by browser autoplay policy).
 *
 * On the very first cold start, this also fires an inaudible warm-up tone
 * immediately. The very first time the audio thread actually renders real
 * audio, there's a one-time setup cost (audio-thread spin-up, and/or
 * Tone.js's own first-use lazy initialization) that can glitch or clip the
 * tail of whatever sound triggers it — a small scheduling lookahead alone
 * isn't enough to dodge this, since the cost isn't purely about clock
 * timing. Paying it here, on a throwaway near-silent tone nobody hears,
 * means the user's actual first press lands on an already-warmed-up
 * engine instead of absorbing the glitch itself. Every call after the
 * first cold start is a no-op beyond the (already-resolved) `Tone.start()`
 * check.
 *
 * Note: the scheduling logic in every voice's `trigger` is independently
 * verified correct via deterministic offline rendering (see the project's
 * verification history) — this warm-up specifically targets the
 * real-time, hardware/OS-level cold-start transition, which is inherently
 * outside what a pure scheduling fix can address.
 *
 * Shared by every instrument's `use<X>Voice` hook rather than re-deriving
 * this per instrument — reach for it in any future voice hook's
 * manual-trigger path (see `components/kick/useKickVoice.ts`).
 */
export const startAudioContext = async (): Promise<void> => {
  const wasSuspended = Tone.getContext().state !== "running";
  await Tone.start();

  if (wasSuspended) {
    // Near-silent rather than literally 0 gain — some engines special-case
    // and skip rendering true silence, which would defeat the point.
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
