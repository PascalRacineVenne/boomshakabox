import { css } from "@linaria/core";
import classNames from "classnames";
import { TRACK_IDS, TRACK_LABELS, type TrackId } from "./useStepSequencer";
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
    background: var(--contrast-1);
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

  stepDisabled: css`
    opacity: 0.3;
  `,
};

const GROUP_SIZE = 4;
export const MINI_GRID_PAGE_SIZE = 32; // MiniGrid always shows this many steps, independent of StepGrid's own 16-wide page
export const MINI_GRID_PAGE_COUNT = 2; // covers the full 64-step max in two halves

interface MiniGridProps {
  patterns: Record<TrackId, boolean[]>;
  currentStep: number; // global (0..length-1)
  length: number;
  miniPage: number; // 0 or 1 — which 32-step half is shown, independent of StepGrid's page
  selectedTrack: TrackId;
  onSelectTrack: (id: TrackId) => void;
}

// Always shows a fixed 32-step window per track (half the max pattern),
// paged independently of StepGrid via miniPage/PageDots — not tied to
// StepGrid's own 16-wide page or auto-follow. Steps at or past the active
// `length` render dimmed rather than being hidden, since their data (if
// any) is still there, just outside what's currently playing.
const MiniGrid = ({
  patterns,
  currentStep,
  length,
  miniPage,
  selectedTrack,
  onSelectTrack,
}: MiniGridProps) => {
  const pageStart = miniPage * MINI_GRID_PAGE_SIZE;

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
  );
};

export default MiniGrid;
