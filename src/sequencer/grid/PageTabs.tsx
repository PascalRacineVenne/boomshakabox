import { css } from "@linaria/core";
import { Segmented } from "antd";
import { STEP_COUNT, type PatternLength } from "./useStepSequencer";

const styles = {
  segmented: css`
    .ant-segmented-thumb,
    .ant-segmented-item-selected {
      background: var(--contrast-1) !important;
    }
    .ant-segmented-item-selected .ant-segmented-item-label {
      color: var(--bg) !important;
    }
  `,
};

interface PageTabsProps {
  length: PatternLength;
  viewedPage: number;
  onSelectPage: (page: number) => void;
}

// Only rendered once length > 16 — at 16 there's exactly one page, so a
// selector would be pure clutter (StepSequencer.tsx skips mounting this
// entirely at length 16 rather than rendering a single, disabled tab).
const PageTabs = ({ length, viewedPage, onSelectPage }: PageTabsProps) => {
  const pageCount = length / STEP_COUNT;

  return (
    <Segmented
      size="small"
      className={styles.segmented}
      value={viewedPage}
      onChange={(value) => onSelectPage(value as number)}
      options={Array.from({ length: pageCount }, (_, page) => ({
        label: `Page ${page + 1}`,
        value: page,
      }))}
    />
  );
};

export default PageTabs;
