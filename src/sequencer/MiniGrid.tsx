import { css } from "@linaria/core";
import classNames from "classnames";
import {
  STEP_COUNT,
  TRACK_IDS,
  TRACK_LABELS,
  type TrackId,
} from "./useStepSequencer";
import { Flex } from "antd";

const styles = {
  container: css`
    padding: calc(var(--audioui-unit) / 4) calc(var(--audioui-unit) / 2);
    border: 1px solid var(--accent-border);
    border-radius: 8px;
    background: black;
  `,

  row: css`
    cursor: pointer;
  `,

  label: css`
    width: 24px;
    flex-shrink: 0;
    font-size: 9px;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  `,

  labelSelected: css`
    color: var(--accent);
  `,

  step: css`
    width: 8px;
    height: 6px;
    border-radius: 1px;
    background: var(--border);
  `,

  stepActive: css`
    background: var(--accent);
  `,

  stepPlayhead: css`
    outline: 1px solid var(--accent-border);
    outline-offset: 1px;
  `,

  stepGroupEnd: css`
    margin-right: 6px;
    padding-right: 4px;
    border-right: 1px solid var(--accent-border);
  `,
};

const GROUP_SIZE = 4;

interface MiniGridProps {
  patterns: Record<TrackId, boolean[]>;
  currentStep: number;
  selectedTrack: TrackId;
  onSelectTrack: (id: TrackId) => void;
}

const MiniGrid = ({
  patterns,
  currentStep,
  selectedTrack,
  onSelectTrack,
}: MiniGridProps) => {
  return (
    <Flex vertical className={styles.container}>
      {[...TRACK_IDS].reverse().map((trackId) => (
        <Flex
          align="center"
          gap={8}
          key={trackId}
          className={styles.row}
          onClick={() => onSelectTrack(trackId)}
        >
          <span
            className={classNames(
              styles.label,
              trackId === selectedTrack && styles.labelSelected,
            )}
          >
            {TRACK_LABELS[trackId]}
            {TRACK_IDS.indexOf(trackId) + 1}
          </span>
          <Flex gap={2}>
            {Array.from({ length: STEP_COUNT }, (_, stepIndex) => (
              <div
                key={stepIndex}
                className={classNames(
                  styles.step,
                  patterns[trackId][stepIndex] && styles.stepActive,
                  stepIndex === currentStep && styles.stepPlayhead,
                  (stepIndex + 1) % GROUP_SIZE === 0 &&
                    stepIndex !== STEP_COUNT - 1 &&
                    styles.stepGroupEnd,
                )}
              />
            ))}
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
};

export default MiniGrid;
