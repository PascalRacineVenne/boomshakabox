import { css } from "@linaria/core";
import { Flex, Segmented } from "antd";
import { PATTERN_LENGTH_OPTIONS, type PatternLength } from "./useStepSequencer";

const styles = {
  panel: css`
    padding: calc(var(--audioui-unit) / 4) calc(var(--audioui-unit) / 2);
    border: 1px solid var(--accent-border);
    border-radius: 8px;
  `,

  title: css`
    font-size: 11px;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,

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

interface LengthControlProps {
  length: PatternLength;
  onChange: (length: PatternLength) => void;
}

// Pattern length is global (one value shared by every voice), so this
// lives near the transport controls rather than inside any single voice's
// panel — see useStepSequencer.ts for where the length state itself lives.
const LengthControl = ({ length, onChange }: LengthControlProps) => (
  <Flex vertical align="center" gap={2}>
    <Flex align="center" justify="center" className={styles.panel}>
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
    </Flex>
    <span className={styles.title}>Length</span>
  </Flex>
);

export default LengthControl;
