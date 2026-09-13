/**
 * The TR-808's hi-hat sums six square-wave VCOs at these fixed,
 * deliberately inharmonic frequencies (the classic 808 hex-oscillator
 * bank) to get a metallic, bell-less clang instead of a musical chord.
 * Both the closed and open hi-hat are the same oscillator bank through a
 * highpass VCF — only the VCA envelope after it differs (short/fixed for
 * closed, longer/knob-controlled for open) — so this stays the one shared
 * source of truth for the frequency set.
 */
export const HI_HAT_OSCILLATOR_FREQUENCIES = [205.3, 304.4, 369.6, 522.7, 540.0, 800.0];
