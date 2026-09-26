import { useEffect, useRef, useState, type RefObject } from "react";
import * as Tone from "tone";
import type { PatternLength, TrackId } from "../sequencerConstants";

type TriggerFn = (scheduledTime?: number, velocity?: number) => void;

export type Voices = Record<TrackId, { trigger: TriggerFn }>;

interface UseSequencerEngineArgs {
  trackIds: readonly TrackId[];
  voices: Voices;
  patternsRef: RefObject<Record<TrackId, boolean[]>>;
  velocitiesRef: RefObject<Record<TrackId, number[]>>;
  length: PatternLength;
  onStepHit?: (step: number, hitTrackIds: TrackId[], time: number) => void;
  onStop?: () => void;
}

export const useSequencerEngine = ({
  trackIds,
  voices,
  patternsRef,
  velocitiesRef,
  length,
  onStepHit,
  onStop,
}: UseSequencerEngineArgs) => {
  const [currentStep, setCurrentStep] = useState(0);

  const lengthRef = useRef(length);
  useEffect(() => {
    lengthRef.current = length;
  }, [length]);

  const voicesRef = useRef(voices);
  useEffect(() => {
    voicesRef.current = voices;
  });

  const onStepHitRef = useRef(onStepHit);
  useEffect(() => {
    onStepHitRef.current = onStepHit;
  });

  const onStopRef = useRef(onStop);
  useEffect(() => {
    onStopRef.current = onStop;
  });

  const stepCountRef = useRef(0);

  useEffect(() => {
    const eventId = Tone.getTransport().scheduleRepeat((time) => {
      const step = stepCountRef.current % lengthRef.current;
      stepCountRef.current += 1;

      const hitTrackIds: TrackId[] = [];
      trackIds.forEach((id) => {
        if (patternsRef.current[id][step]) {
          hitTrackIds.push(id);
          voicesRef.current[id].trigger(time, velocitiesRef.current[id][step]);
        }
      });

      Tone.getDraw().schedule(() => {
        setCurrentStep(step);
        onStepHitRef.current?.(step, hitTrackIds, time);
      }, time);
    }, "16n");

    const handleTransportStop = () => {
      stepCountRef.current = 0;
      setCurrentStep(0);
      onStopRef.current?.();
    };
    Tone.getTransport().on("stop", handleTransportStop);

    return () => {
      Tone.getTransport().clear(eventId);
      Tone.getTransport().off("stop", handleTransportStop);
    };
  }, [trackIds, patternsRef, velocitiesRef]);

  return { currentStep };
};
