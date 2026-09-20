import { css } from "@linaria/core";
import { Flex } from "antd";
import TempoKnob from "./TempoKnob";
import TransportControls from "./TransportControls";
import MetronomeClick from "./MetronomeClick";

const styles = {
  grid: css`
    gap: calc(var(--audioui-unit) / 4) calc(var(--audioui-unit) * 0.5);
    padding: calc(var(--audioui-unit) / 4) calc(var(--audioui-unit) / 2);
    border: 1px solid var(--accent-border);
    border-radius: 8px;
  `,
};

/**
 * Groups the sequencer's tempo input, beat pulse, transport buttons, and
 * metronome click into a 2x2 grid:
 *
 *   TempoKnob          BeatIndicator
 *   TransportControls  MetronomeClick
 *
 * so the tempo readout and its at-a-glance beat pulse sit on top, with the
 * play/stop and click controls that act on that tempo lined up right
 * underneath.
 */
const TempoTransportPanel = () => {
  return (
    <Flex align="center" className={styles.grid}>
      <TempoKnob />
      <TransportControls />
      <MetronomeClick />
    </Flex>
  );
};

export default TempoTransportPanel;
