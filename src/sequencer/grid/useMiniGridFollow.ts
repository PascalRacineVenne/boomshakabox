import { useState } from "react";
import { MINI_GRID_RANGE_SIZE } from "./useStepSequencer";

export const useMiniGridFollow = (currentStep: number) => {
  const [manualRange, setManualRange] = useState(0);
  const [autoFollow, setAutoFollow] = useState(true);

  const liveRange = Math.floor(currentStep / MINI_GRID_RANGE_SIZE);
  const miniRange = autoFollow ? liveRange : manualRange;

  const goToMiniRange = (range: number) => {
    setManualRange(range);
    setAutoFollow(range === liveRange);
  };

  const reset = () => {
    setManualRange(0);
    setAutoFollow(true);
  };

  return { miniRange, goToMiniRange, reset };
};
