import { useCallback, useState } from "react";
import { clamp } from "../../lib/clamp";
import {
  DELAY_TIME_DIVISIONS,
  DELAY_TIME_LABELS,
  DEFAULT_DELAY_TIME_INDEX,
  DEFAULT_DELAY_FEEDBACK,
  DEFAULT_VERB_LENGTH,
  setDelayTimeDivision,
  setDelayFeedback,
  setVerbLength,
} from "../../lib/delayReverbInsert";

export const useDelayReverbBus = () => {
  const [delayTimeIndex, setDelayTimeIndexState] = useState(
    DEFAULT_DELAY_TIME_INDEX,
  );
  const [delayFeedback, setDelayFeedbackState] = useState(
    DEFAULT_DELAY_FEEDBACK,
  );
  const [verbLength, setVerbLengthState] = useState(DEFAULT_VERB_LENGTH);

  const setDelayTimeIndexValue = useCallback((index: number) => {
    const clamped = clamp(index, 0, DELAY_TIME_DIVISIONS.length - 1);
    setDelayTimeIndexState(clamped);
    setDelayTimeDivision(clamped);
  }, []);

  const setDelayFeedbackValue = useCallback((value: number) => {
    const clamped = clamp(value, 0, 1);
    setDelayFeedbackState(clamped);
    setDelayFeedback(clamped);
  }, []);

  const setVerbLengthValue = useCallback((value: number) => {
    const clamped = clamp(value, 0, 1);
    setVerbLengthState(clamped);
    setVerbLength(clamped);
  }, []);

  return {
    delayTimeIndex,
    setDelayTimeIndex: setDelayTimeIndexValue,
    maxDelayTimeIndex: DELAY_TIME_DIVISIONS.length - 1,
    delayTimeLabels: DELAY_TIME_LABELS,
    delayFeedback,
    setDelayFeedback: setDelayFeedbackValue,
    verbLength,
    setVerbLength: setVerbLengthValue,
  };
};
