import { useTrackPatterns } from "../engine/useTrackPatterns";
import { useSequencerEngine, type Voices } from "../engine/useSequencerEngine";
import { useSequencerHitFlash } from "../engine/useSequencerHitFlash";
import { useGridPaging } from "./useGridPaging";
import { useMiniGridFollow } from "./useMiniGridFollow";
import { TRACK_IDS } from "../sequencerConstants";

export const useStepSequencer = (voices: Voices) => {
  const {
    patternsRef,
    patternsDisplay,
    velocitiesRef,
    velocitiesDisplay,
    selectedTrack,
    selectTrack,
    setStep: setAbsoluteStep,
    setVelocity: setAbsoluteVelocity,
    clearTrack,
  } = useTrackPatterns();

  const {
    length,
    setLength,
    viewedRange,
    goToRange,
    rangeStart,
    activePattern,
    activeVelocities,
  } = useGridPaging({ patternsDisplay, velocitiesDisplay, selectedTrack });

  const hitFlash = useSequencerHitFlash(TRACK_IDS);

  const { currentStep } = useSequencerEngine({
    trackIds: TRACK_IDS,
    voices,
    patternsRef,
    velocitiesRef,
    length,
    onStepHit: (_step, hitTrackIds) => {
      hitFlash.reportHit(hitTrackIds);
    },
    onStop: () => {
      hitFlash.reset();
      miniGridFollow.reset();
    },
  });

  const miniGridFollow = useMiniGridFollow(currentStep);

  const setStep = (rangeStepIndex: number, active: boolean) => {
    setAbsoluteStep(rangeStart + rangeStepIndex, active);
  };

  const setVelocity = (rangeStepIndex: number, velocity: number) => {
    setAbsoluteVelocity(rangeStart + rangeStepIndex, velocity);
  };

  return {
    patternsDisplay,
    activePattern,
    velocitiesDisplay,
    activeVelocities,
    selectedTrack,
    selectTrack,
    currentStep,
    setStep,
    setVelocity,
    clearTrack,
    length,
    setLength,
    viewedRange,
    goToRange,
    miniRange: miniGridFollow.miniRange,
    goToMiniRange: miniGridFollow.goToMiniRange,
    sequencerHits: hitFlash.sequencerHits,
  };
};
