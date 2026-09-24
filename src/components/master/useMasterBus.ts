import { useCallback, useState } from "react";
import { clamp } from "../../lib/clamp";
import { masterGain } from "../../lib/masterBus";

const DEFAULT_VOLUME = 75;

export const useMasterBus = () => {
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);

  const setVolume = useCallback((value: number) => {
    const clamped = clamp(value, 0, 100);
    setVolumeState(clamped);
    masterGain.gain.rampTo(clamped / 100, 0.02);
  }, []);

  return {
    volume,
    setVolume,
  };
};
