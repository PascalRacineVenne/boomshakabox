import { css } from "@linaria/core";
import classNames from "classnames";
import {
  TRACK_IDS,
  TRACK_LABELS,
  MINI_GRID_PAGE_SIZE,
  MINI_GRID_PAGE_COUNT,
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
  currentStep: number; // global (0..length-1)
  length: number;
  miniPage: number; // 0 or 1 — which 32-step half is shown, independent of StepGrid's page
  selectedTrack: TrackId;
  onSelectTrack: (id: TrackId) => void;
  onSelectPage?: (page: number) => void;
}

const MiniGrid = ({
  patterns,
  currentStep,
  length,
  miniPage,
  selectedTrack,
  onSelectTrack,
  onSelectPage,
}: MiniGridProps) => {
  const pageStart = miniPage * MINI_GRID_PAGE_SIZE;

  return (
    <Flex vertical align="center" gap={2} className={styles.container}>
      {MINI_GRID_PAGE_COUNT > 1 && (
        <Flex gap={4} className={styles.dots}>
          {Array.from({ length: MINI_GRID_PAGE_COUNT }, (_, page) => (
            <div
              key={page}
              className={classNames(
                styles.dot,
                page === miniPage && styles.dotViewed,
              )}
              onClick={() => onSelectPage?.(page)}
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
              {Array.from({ length: MINI_GRID_PAGE_SIZE }, (_, i) => {
                const stepIndex = pageStart + i;
                return (
                  <div
                    key={stepIndex}
                    className={classNames(
                      styles.step,
                      patterns[trackId][stepIndex] && styles.stepActive,
                      stepIndex === currentStep && styles.stepPlayhead,
                      stepIndex >= length && styles.stepDisabled,
                      (i + 1) % GROUP_SIZE === 0 &&
                        i !== MINI_GRID_PAGE_SIZE - 1 &&
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
