/**
 * Clamps a numeric value to the inclusive [min, max] range.
 *
 * Used anywhere a UI control or externally-supplied value needs to be
 * guarded before reaching an audio-engine parameter — e.g. the sequencer
 * plan's step 10 ("Add min/max BPM guards... to prevent invalid values
 * reaching the Transport"), and the same guard applies to any other
 * bounded parameter (tone frequency, volume, etc.).
 *
 * @param value - The value to clamp.
 * @param min - The inclusive lower bound.
 * @param max - The inclusive upper bound.
 * @returns `value` restricted to the [min, max] range.
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};
