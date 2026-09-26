import { css } from "@linaria/core";
import { Flex, Segmented } from "antd";
import { PATTERN_LENGTH_OPTIONS, type PatternLength } from "./useStepSequencer";

const styles = {
  panel: css`
    min-height: 50px;
    padding: calc(var(--audioui-unit) / 4);
    border: 1px solid var(--accent-border);
    border-radius: 8px;
    width: 100%;
  `,

  title: css`
    font-size: 11px;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1.5;
  `,

  segmented: css`
    background: black;
    .ant-segmented-thumb,
    .ant-segmented-item-selected {
      background: var(--contrast-1) !important;
    }
    .ant-segmented-item-selected .ant-segmented-item-label {
      color: var(--bg) !important;
    }
    :not(.ant-segmented-item-selected) {
      color: var(--accent) !important;
    }
  `,
};

interface LengthControlProps {
  length: PatternLength;
  onChange: (length: PatternLength) => void;
}

const LengthControl = ({ length, onChange }: LengthControlProps) => (
  <Flex
    vertical
    align="center"
    justify="space-between"
    className={styles.panel}
  >
    <Segmented
      size="small"
      className={styles.segmented}
      value={length}
      onChange={(value) => onChange(value as PatternLength)}
      options={PATTERN_LENGTH_OPTIONS.map((value) => ({
        label: `${value}`,
        value,
      }))}
    />
    <span className={styles.title}>Length</span>
  </Flex>
);

export default LengthControl;
