import { css } from "@linaria/core";
import { Knob } from "@cutoff/audio-ui-react";
import { InputNumber } from "antd";
import { useTempo } from "./useTempo";

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  `,
};

/**
 * Primary tempo dial: a continuous rotary Knob, per the sequencer plan's
 * recommendation to use audio-ui-react for the main tempo control and
 * reserve AntD for secondary/utility controls (like TransportControls'
 * Start/Stop) — so the two knob-style widgets don't compete for the same
 * parameter's "feel." The AntD InputNumber below it is exactly that kind
 * of secondary/utility control: a numbers-only text entry for typing an
 * exact BPM directly, rather than dragging.
 *
 * Both controls read/write the same `useTempo()` instance called once
 * here, so there's a single `bpm` value and a single `setBpm` — turning
 * the knob updates the number, typing a number updates the knob, always
 * in sync because they're two views over the same state rather than two
 * independently-tracked copies of it.
 */
const TempoKnob = () => {
  const { bpm, setBpm, min, max } = useTempo();

  return (
    <div className={styles.container}>
      <Knob
        variant="plainCap"
        min={min}
        max={max}
        value={bpm}
        onChange={(e) => setBpm(e.value)}
        label={bpm.toFixed(0) + " bpm"}
        valueAsLabel="interactive"
      />
      <InputNumber
        min={min}
        max={max}
        value={bpm}
        precision={0}
        onChange={(value) => {
          if (value !== null) setBpm(value);
        }}
        size="small"
        style={{ width: 64 }}
      />
    </div>
  );
};

export default TempoKnob;
