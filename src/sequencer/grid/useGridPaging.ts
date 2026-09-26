import { useState } from "react";
import {
  STEP_COUNT,
  type PatternLength,
  type TrackId,
} from "../sequencerConstants";

const DEFAULT_LENGTH: PatternLength = 16;

interface UseGridPagingArgs {
  patternsDisplay: Record<TrackId, boolean[]>;
  velocitiesDisplay: Record<TrackId, number[]>;
  selectedTrack: TrackId;
}

export const useGridPaging = ({
  patternsDisplay,
  velocitiesDisplay,
  selectedTrack,
}: UseGridPagingArgs) => {
  const [length, setLength] = useState<PatternLength>(DEFAULT_LENGTH);
  const [viewedRange, setViewedRange] = useState(0);

  const changeLength = (nextLength: PatternLength) => {
    setLength(nextLength);
    const maxRange = nextLength / STEP_COUNT - 1;
    setViewedRange((prev) => Math.min(prev, maxRange));
  };

  const rangeStart = viewedRange * STEP_COUNT;

  return {
    length,
    setLength: changeLength,
    viewedRange,
    goToRange: setViewedRange,
    rangeStart,
    activePattern: patternsDisplay[selectedTrack].slice(
      rangeStart,
      rangeStart + STEP_COUNT,
    ),
    activeVelocities: velocitiesDisplay[selectedTrack].slice(
      rangeStart,
      rangeStart + STEP_COUNT,
    ),
  };
};
