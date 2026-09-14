import { css } from "@linaria/core";
import classNames from "classnames";
import { Button } from "@cutoff/audio-ui-react";
import { STEP_COUNT } from "./useStepSequencer";

const GROUP_SIZE = 4; // groups of 4 steps, matching a 4/4 beat boundary

const styles = {
  steps: css`
    display: flex;
    gap: 4px;
  `,
  group: css`
    display: flex;
    gap: 4px;
    padding-right: 8px;
  `,
  playhead: css`
    outline: 2px solid var(--accent);
    outline-offset: 1px;
    border-radius: 4px;
  `,
};

interface StepGridProps {
  active: boolean[];
  currentStep: number;
  onStepChange: (stepIndex: number, active: boolean) => void;
}

/**
 * The single 16-step toggle row, grouped in 4s to show beat boundaries —
 * the same "make the bar structure visible" idea as `BeatIndicator`'s
 * larger downbeat dot. There is only one grid: it always shows and edits
 * whichever instrument is currently selected (see `StepSequencer.tsx`),
 * not one grid per track. The currently-playing step gets an accent
 * outline, driven by the sequencer's `Tone.Draw`-synced `currentStep`.
 *
 * `Button` in latch mode natively supports press-and-drag painting across
 * steps — it toggles each step the pointer enters while still held — so no
 * custom drag handling is needed here.
 */
const StepGrid = ({ active, currentStep, onStepChange }: StepGridProps) => {
  const groupCount = STEP_COUNT / GROUP_SIZE;

  return (
    <div className={styles.steps}>
      {Array.from({ length: groupCount }, (_, groupIndex) => (
        <div key={groupIndex} className={styles.group}>
          {Array.from({ length: GROUP_SIZE }, (_, i) => {
            const stepIndex = groupIndex * GROUP_SIZE + i;
            return (
              <Button
                key={stepIndex}
                latch
                size="small"
                label={`${stepIndex + 1}`}
                value={active[stepIndex]}
                onChange={(e) => onStepChange(stepIndex, e.value)}
                className={classNames(
                  currentStep === stepIndex && styles.playhead,
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default StepGrid;
