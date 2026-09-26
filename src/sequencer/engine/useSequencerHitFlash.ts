import { useEffect, useRef, useState } from "react";
import type { TrackId } from "../sequencerConstants";

const SEQUENCER_HIT_FLASH_MS = 60;

const noHits = (trackIds: readonly TrackId[]): Record<TrackId, boolean> =>
  Object.fromEntries(trackIds.map((id) => [id, false])) as Record<
    TrackId,
    boolean
  >;

export const useSequencerHitFlash = (trackIds: readonly TrackId[]) => {
  const [sequencerHits, setSequencerHits] = useState(() => noHits(trackIds));
  const flashTimeoutsRef = useRef(
    {} as Record<TrackId, ReturnType<typeof setTimeout> | undefined>,
  );

  const reportHit = (hitTrackIds: TrackId[]) => {
    hitTrackIds.forEach((id) => {
      clearTimeout(flashTimeoutsRef.current[id]);
      setSequencerHits((prev) => ({ ...prev, [id]: true }));
      flashTimeoutsRef.current[id] = setTimeout(() => {
        setSequencerHits((prev) => ({ ...prev, [id]: false }));
      }, SEQUENCER_HIT_FLASH_MS);
    });
  };

  const reset = () => {
    const flashTimeouts = flashTimeoutsRef.current;
    trackIds.forEach((id) => clearTimeout(flashTimeouts[id]));
    setSequencerHits(noHits(trackIds));
  };

  useEffect(() => {
    const flashTimeouts = flashTimeoutsRef.current;
    return () => {
      trackIds.forEach((id) => clearTimeout(flashTimeouts[id]));
    };
  }, [trackIds]);

  return { sequencerHits, reportHit, reset };
};
