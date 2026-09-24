import { css } from "@linaria/core";
import { InputNumber } from "antd";
import { useTempo } from "./useTempo";

const styles = {
  input: css`
    text-align: center !important;
    font-size: 20px !important;
    font-weight: 700 !important;
    line-height: 1 !important;
    color: var(--accent) !important;
    height: auto !important;
    border: 1px solid var(--accent) !important;
    border-radius: 8px !important;

    &.ant-input-number-focused {
      outline: none !important;
    }
  `,

  root: css`
    padding-inline: 0;
    &.ant-input-number-focused {
      outline: none !important;
    }
  `,
};

const TempoInput = () => {
  const { bpm, setBpm, min, max } = useTempo();

  return (
    <InputNumber
      classNames={{ input: styles.input, root: styles.root }}
      variant="borderless"
      controls={false}
      min={min}
      max={max}
      precision={0}
      value={bpm}
      onChange={(value) => {
        if (value !== null) setBpm(Number(value));
      }}
    />
  );
};

export default TempoInput;
