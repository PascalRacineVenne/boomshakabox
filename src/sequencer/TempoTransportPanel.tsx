import { css } from "@linaria/core";
import { Flex } from "antd";
import TempoInput from "./TempoInput";
import TransportControls from "./TransportControls";
import MetronomeClick from "./MetronomeClick";

const styles = {
  grid: css`
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
};

const GAP = "calc(var(--audioui-unit) / 4) calc(var(--audioui-unit) * 0.5)";

/**
 * Groups the sequencer's tempo input, beat pulse, transport buttons, and
 * metronome click into a 2x2 grid:
 *
 *   TempoInput          BeatIndicator
 *   TransportControls  MetronomeClick
 *
 * so the tempo readout and its at-a-glance beat pulse sit on top, with the
 * play/stop and click controls that act on that tempo lined up right
 * underneath.
 */
const TempoTransportPanel = () => {
  return (
    <Flex vertical justify="center">
      <Flex align="center" gap={GAP} className={styles.grid}>
        <TempoInput />
        <TransportControls />
        <MetronomeClick />
      </Flex>
      <span className={styles.title}>Transport</span>
    </Flex>
  );
};

export default TempoTransportPanel;
