/**
 * `Tone.Distortion`'s curve (from its source: `(3+k)x*20deg / (PI+k|x|)`,
 * where `k = amount*100`) isn't a soft-clipper like a raw tanh curve —
 * it's a compressive curve that squashes full-scale input down hard (at
 * x=1 it only outputs ~0.35 with amount=0.4). That's the "eaten low end":
 * the fundamental's peak amplitude gets crushed by ~2.9x, not filtered.
 *
 * Shared between any voice that layers `Tone.Distortion` after an
 * oscillator/synth and wants to restore the level it crushes (currently
 * `components/kick/useKickVoice.ts`; reach for it again for any future
 * instrument that adds a distortion/drive stage).
 *
 * @param amount - The `Tone.Distortion` `distortion` amount (0-1) this
 * makeup gain is compensating for.
 * @returns The linear gain multiplier that restores the curve's peak
 * output back to unity.
 */
export const distortionMakeupGain = (amount: number): number => {
  const k = amount * 100;
  const deg = Math.PI / 180;
  const peakOutput = ((3 + k) * 20 * deg) / (Math.PI + k); // curve value at x=1
  return 1 / peakOutput;
};
