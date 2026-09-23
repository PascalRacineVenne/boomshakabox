import { useState } from "react";
import { css } from "@linaria/core";
import { Slider } from "@cutoff/audio-ui-react";
import { Flex } from "antd";
import { STEP_COUNT } from "./useStepSequencer";

// Must match StepGrid's own GROUP_SIZE/gap/group padding — these sliders
// only land under their steps if this row is laid out identically.
const GROUP_SIZE = 4;
const GAP = 4;

const styles = {
  toggle: css`
    font-size: 11px;
    color: var(--text);
    cursor: pointer;
    user-select: none;
    width: fit-content;
  `,
  group: css`
    padding-right: 16px;
  `,
};

interface VelocityRowProps {
  velocities: number[];
  onVelocityChange: (stepIndex: number, velocity: number) => void;
}

/**
 * Per-step velocity for whichever track `StepGrid` is currently showing —
 * one vertical Slider per step, grouped/spaced identically to `StepGrid`'s
 * own Buttons so each slider lands directly under its step (see
 * `StepSequencer.tsx` for the label-width offset that keeps the whole row
 * aligned under the grid, not just each slider under its own step).
 *
 * Collapsed behind its own "Velocity" toggle and owns that visibility
 * itself — a secondary, occasional-use control that shouldn't always eat
 * vertical space under the main grid, and the rest of `StepSequencer`
 * doesn't need to know or care whether it's open.
 */
const VelocityRow = ({ velocities, onVelocityChange }: VelocityRowProps) => {
  const [visible, setVisible] = useState(false);
  const groupCount = STEP_COUNT / GROUP_SIZE;

  return (
    <Flex vertical gap={4}>
      <span
        className={styles.toggle}
        onClick={() => setVisible((prev) => !prev)}
      >
        Velocity {visible ? "⌄" : "›"}
      </span>
      {visible && (
        <Flex gap={GAP}>
          {Array.from({ length: groupCount }, (_, groupIndex) => (
            <Flex key={groupIndex} gap={GAP} className={styles.group}>
              {Array.from({ length: GROUP_SIZE }, (_, i) => {
                const stepIndex = groupIndex * GROUP_SIZE + i;
                return (
                  <Slider
                    key={stepIndex}
                    min={0}
                    max={100}
                    step={1}
                    size="small"
                    value={velocities[stepIndex]}
                    onChange={(drag) =>
                      onVelocityChange(stepIndex, drag.value)
                    }
                    label="Vel"
                    bipolar={false}
                    thickness={1}
                    orientation="vertical"
                    valueAsLabel="interactive"
                    variant="trackless"
                    cursorSize="Track"
                  />
                );
              })}
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default VelocityRow;
