export const computeLevel = (muted: boolean, volume: number, velocity = 100) =>
  muted ? 0 : (volume / 100) * (velocity / 100);
