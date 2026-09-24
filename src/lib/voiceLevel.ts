// Volume x the step's velocity (0-100%), forced silent while muted. Shared
// by every useXVoice.ts hook's trigger() (real velocity) and
// renderFullWaveform() (velocity defaults to 100, i.e. just volume).
export const computeLevel = (
  muted: boolean,
  volume: number,
  velocity = 100,
) => (muted ? 0 : (volume / 100) * (velocity / 100));
