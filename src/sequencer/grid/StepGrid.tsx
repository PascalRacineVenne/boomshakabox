import { css } from "@linaria/core";
import classNames from "classnames";
import { Button } from "@cutoff/audio-ui-react";
import { STEP_COUNT } from "./useStepSequencer";
import { Flex } from "antd";

const GROUP_SIZE = 4;

const styles = {
  group: css`
    padding-right: 16px;
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
  startNumber?: number; // label offset — lets a page show absolute step numbers (e.g. 17-32) instead of always 1-16
}

const StepGrid = ({
  active,
  currentStep,
  onStepChange,
  startNumber = 1,
}: StepGridProps) => {
  const groupCount = STEP_COUNT / GROUP_SIZE;

  return (
    <Flex gap={4}>
      {Array.from({ length: groupCount }, (_, groupIndex) => (
        <Flex key={groupIndex} gap={4} className={styles.group}>
          {Array.from({ length: GROUP_SIZE }, (_, i) => {
            const stepIndex = groupIndex * GROUP_SIZE + i;
            return (
              <Button
                key={stepIndex}
                latch
                size="small"
                label={`${startNumber + stepIndex}`}
                value={active[stepIndex]}
                onChange={(e) => onStepChange(stepIndex, e.value)}
                className={classNames(
                  currentStep === stepIndex && styles.playhead,
                )}
              />
            );
          })}
        </Flex>
      ))}
    </Flex>
  );
};

export default StepGrid;
