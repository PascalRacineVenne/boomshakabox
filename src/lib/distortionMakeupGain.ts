export const distortionMakeupGain = (amount: number): number => {
  const k = amount * 100;
  const deg = Math.PI / 180;
  const peakOutput = ((3 + k) * 20 * deg) / (Math.PI + k); // curve value at x=1
  return 1 / peakOutput;
};
