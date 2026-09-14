import { css } from "@linaria/core";
import TempoKnob from "./TempoKnob";
import TransportControls from "./TransportControls";
import BeatIndicator from "./BeatIndicator";
import MetronomeClick from "./MetronomeClick";

const styles = {
  grid: css`
    display: inline-grid;
    grid-template-columns: auto auto;
    align-items: center;
    justify-items: center;
    // gap: calc(var(--audioui-unit) / 4) calc(var(--audioui-unit) * 1.5);
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
    <div className={styles.grid}>
      <TempoKnob />
      <TransportControls />
      <BeatIndicator />
      <MetronomeClick />
    </div>
  );
};

export default TempoTransportPanel;
