import { css } from "@linaria/core";
import classNames from "classnames";
import { Flex } from "antd";
import { STEP_COUNT, TRACK_IDS, type TrackId } from "./useStepSequencer";

const styles = {
  container: css`
    padding: 2px calc(var(--audioui-unit) / 2);
  `,
  group: css`
    padding: 3px;
    border-radius: 3px;
    border: 1px solid transparent;
    cursor: pointer;
  `,
  groupViewed: css`
    border-color: var(--contrast-1);
  `,
  step: css`
    width: 4px;
    height: 10px;
    border-radius: 1px;
    background: var(--border);
  `,
  stepActive: css`
    background: var(--accent);
  `,
  stepPlayhead: css`
    background: var(--contrast-1);
  `,
};

interface PatternOverviewProps {
  patterns: Record<TrackId, boolean[]>;
  currentStep: number;
  length: number;
  viewedPage: number;
  onSelectPage: (page: number) => void;
}

/**
 * A glance/orientation strip — one mark per step across the whole pattern
 * (not just the viewed page), grouped by 16 (one group per page). Shows,
 * per step, whether any voice has data there (not full per-voice detail —
 * that's what the main grid + MiniGrid are for), plus the live playhead
 * and which group is the currently viewed page. Clicking a group jumps
 * the main grid to that page, reusing the same goToPage action the
 * required page tabs use — so this doubles as a way to resume auto-follow
 * too, not just a display.
 */
const PatternOverview = ({
  patterns,
  currentStep,
  length,
  viewedPage,
  onSelectPage,
}: PatternOverviewProps) => {
  const pageCount = length / STEP_COUNT;

  return (
    <Flex gap={6} className={styles.container}>
      {Array.from({ length: pageCount }, (_, page) => (
        <Flex
          key={page}
          gap={1}
          className={classNames(
            styles.group,
            page === viewedPage && styles.groupViewed,
          )}
          onClick={() => onSelectPage(page)}
        >
          {Array.from({ length: STEP_COUNT }, (_, i) => {
            const step = page * STEP_COUNT + i;
            const active = TRACK_IDS.some((id) => patterns[id][step]);
            return (
              <div
                key={step}
                className={classNames(
                  styles.step,
                  active && styles.stepActive,
                  step === currentStep && styles.stepPlayhead,
                )}
              />
            );
          })}
        </Flex>
      ))}
    </Flex>
  );
};

export default PatternOverview;
