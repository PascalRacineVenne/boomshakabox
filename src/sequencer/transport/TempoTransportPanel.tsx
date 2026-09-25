import { css } from "@linaria/core";
import { Flex } from "antd";
import TempoInput from "./TempoInput";
import TransportControls from "./TransportControls";
import MetronomeClick from "./MetronomeClick";

const styles = {
  // antd's Flex `align` prop doesn't accept "stretch" as a value (it's
  // silently dropped — no class or style gets emitted for it), so this is
  // set directly rather than via the `align` prop.
  grid: css`
    align-items: stretch !important;
    padding: calc(var(--audioui-unit) / 4);
    border: 1px solid var(--accent-border);
    border-radius: 8px;
  `,
};

const GAP = "calc(var(--audioui-unit) / 4) calc(var(--audioui-unit) * 0.5)";

interface TempoTransportPanelProps {
  isPlaying: boolean;
  togglePlayPause: () => void;
  stop: () => void;
}

const TempoTransportPanel = ({
  isPlaying,
  togglePlayPause,
  stop,
}: TempoTransportPanelProps) => {
  return (
    <Flex vertical justify="center">
      <Flex gap={GAP} className={styles.grid}>
        <TempoInput />
        <TransportControls
          isPlaying={isPlaying}
          togglePlayPause={togglePlayPause}
          stop={stop}
        />
        <MetronomeClick />
      </Flex>
    </Flex>
  );
};

export default TempoTransportPanel;
