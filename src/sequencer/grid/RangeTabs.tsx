import { css } from "@linaria/core";
import { Segmented } from "antd";
import { STEP_COUNT, type PatternLength } from "./useStepSequencer";

const styles = {
  segmented: css`
    background: var(--bg);
    .ant-segmented-thumb,
    .ant-segmented-item-selected {
      background: var(--contrast-1) !important;
    }
    .ant-segmented-item-selected .ant-segmented-item-label {
      color: var(--bg) !important;
    }

    :not(.ant-segmented-item-selected) {
      color: var(--accent);
    }
  `,
};

interface RangeTabsProps {
  length: PatternLength;
  viewedRange: number;
  onSelectRange: (range: number) => void;
}

const RangeTabs = ({ length, viewedRange, onSelectRange }: RangeTabsProps) => {
  const rangeCount = length / STEP_COUNT;

  return (
    <Segmented
      size="small"
      className={styles.segmented}
      value={viewedRange}
      onChange={(value) => onSelectRange(value as number)}
      options={Array.from({ length: rangeCount }, (_, range) => ({
        label: `${range * STEP_COUNT + 1}–${(range + 1) * STEP_COUNT}`,
        value: range,
      }))}
    />
  );
};

export default RangeTabs;
