import { css } from "@linaria/core";
import { InputNumber } from "antd";
import { useTempo } from "./useTempo";

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  `,

  root: css`
    width: 140px;
  `,

  // AntD's own rule for this element is a two-class compound selector
  // (".ant-input-number .ant-input-number-input") wrapped in :where() only
  // around its own hash — that still outranks our single custom class, so
  // !important is needed here regardless of stylesheet insertion order.
  input: css`
    text-align: center !important;
    font-size: var(--audioui-unit) !important;
    font-weight: 700 !important;
    line-height: 1 !important;
    color: var(--accent) !important;
    height: auto !important;
  `,

  unit: css`
    font-size: 11px;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,
};

/**
 * Primary tempo control: one big number input in `--accent`, the panel's
 * headline control now that there's no dial to drag — type an exact BPM
 * directly. Reads/writes the same `useTempo()` state that
 * `Tone.getTransport().bpm` is the source of truth for, so this stays in
 * sync with anything else that touches tempo.
 *
 * AntD's `InputNumber` per the sequencer plan's convention of reserving
 * AntD for secondary/utility controls — `variant="borderless"` and
 * `controls={false}` strip its default box and stepper arrows so it reads
 * as a bare number rather than a form field, and the semantic
 * `classNames.input` prop styles the actual `<input>` directly instead of
 * fighting internal AntD class names.
 */
const TempoKnob = () => {
  const { bpm, setBpm, min, max } = useTempo();

  return (
    <div className={styles.container}>
      <InputNumber
        className={styles.root}
        classNames={{ input: styles.input }}
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
      <span className={styles.unit}>BPM</span>
    </div>
  );
};

export default TempoKnob;
