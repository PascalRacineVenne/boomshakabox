import { css } from "@linaria/core";
import classNames from "classnames";
import { Flex } from "antd";
import { STEP_COUNT, type PatternLength } from "./useStepSequencer";

const styles = {
  dot: css`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--border);
    cursor: pointer;
  `,
  dotViewed: css`
    background: var(--contrast-1);
  `,
};

interface PageDotsProps {
  length: PatternLength;
  viewedPage: number;
  onSelectPage: (page: number) => void;
}

// A compact "which page is MiniGrid showing" cue — MiniGrid sits up by the
// oscilloscope, physically far from PageTabs/PatternOverview down by
// StepGrid, so this gives orientation without needing to look down.
// Only rendered once length > 16 (see StepSequencer.tsx) — at 16 there's
// exactly one page, so a single dot would just be noise.
const PageDots = ({ length, viewedPage, onSelectPage }: PageDotsProps) => {
  const pageCount = length / STEP_COUNT;

  return (
    <Flex gap={4} align="center">
      {Array.from({ length: pageCount }, (_, page) => (
        <div
          key={page}
          className={classNames(styles.dot, page === viewedPage && styles.dotViewed)}
          onClick={() => onSelectPage(page)}
        />
      ))}
    </Flex>
  );
};

export default PageDots;
