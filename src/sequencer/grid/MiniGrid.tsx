import { css } from "@linaria/core";
import classNames from "classnames";
import {
  TRACK_IDS,
  TRACK_LABELS,
  MINI_GRID_RANGE_SIZE,
  MINI_GRID_RANGE_COUNT,
  type TrackId,
} from "../sequencerConstants";
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
    line-height: 1.7;
  `,

  labelSelected: css`
    color: var(--accent);
  `,

  step: css`
    width: 8px;
    height: 8px;
    border-radius: 1px;
    background: var(--border);
  `,

  stepActive: css`
    background: var(--contrast-1);
  `,

  stepPlayhead: css`
    outline: 1px solid var(--contrast-2);
    outline-offset: 1px;
  `,

  stepGroupEnd: css`
    margin-right: 6px;
  `,

  stepDisabled: css`
    opacity: 0.3;
  `,

  dots: css`
    padding-bottom: 4px;
  `,

  dot: css`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border);
    cursor: pointer;
  `,

  dotViewed: css`
    background: var(--contrast-1);
  `,
};

const GROUP_SIZE = 4;

interface MiniGridProps {
  patterns: Record<TrackId, boolean[]>;
  currentStep: number;
  length: number;
  miniRange: number;
  selectedTrack: TrackId;
  onSelectTrack: (id: TrackId) => void;
  onSelectRange?: (range: number) => void;
}

const MiniGrid = ({
  patterns,
  currentStep,
  length,
  miniRange,
  selectedTrack,
  onSelectTrack,
  onSelectRange,
}: MiniGridProps) => {
  const rangeStart = miniRange * MINI_GRID_RANGE_SIZE;

  return (
    <Flex vertical align="center" gap={2} className={styles.container}>
      {MINI_GRID_RANGE_COUNT > 1 && (
        <Flex gap={4} className={styles.dots}>
          {Array.from({ length: MINI_GRID_RANGE_COUNT }, (_, range) => (
            <div
              key={range}
              className={classNames(
                styles.dot,
                range === miniRange && styles.dotViewed,
              )}
              onClick={() => onSelectRange?.(range)}
            />
          ))}
        </Flex>
      )}
      <Flex vertical>
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
              {Array.from({ length: MINI_GRID_RANGE_SIZE }, (_, i) => {
                const stepIndex = rangeStart + i;
                return (
                  <div
                    key={stepIndex}
                    className={classNames(
                      styles.step,
                      patterns[trackId][stepIndex] && styles.stepActive,
                      stepIndex === currentStep && styles.stepPlayhead,
                      stepIndex >= length && styles.stepDisabled,
                      (i + 1) % GROUP_SIZE === 0 &&
                        i !== MINI_GRID_RANGE_SIZE - 1 &&
                        styles.stepGroupEnd,
                    )}
                  />
                );
              })}
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default MiniGrid;
