import { useEffect, useState } from "react";
import * as Tone from "tone";

const FLASH_DURATION_MS = 100;

export const useBeatPulse = () => {
  const [pulse, setPulse] = useState<1 | 2>(1);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let beatCount = 0;
    let flashTimeout: ReturnType<typeof setTimeout> | undefined;

    const loop = new Tone.Loop((time) => {
      const currentPulse = beatCount % 2 === 0 ? 1 : 2;
      beatCount += 1;

      Tone.getDraw().schedule(() => {
        setPulse(currentPulse);
        setFlash(true);
        clearTimeout(flashTimeout);
        flashTimeout = setTimeout(() => setFlash(false), FLASH_DURATION_MS);
      }, time);
    }, "4n").start(0);

    return () => {
      loop.dispose();
      clearTimeout(flashTimeout);
    };
  }, []);

  return { pulse, flash };
};
