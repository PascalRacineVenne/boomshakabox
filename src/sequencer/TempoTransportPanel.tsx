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
      <Flex align="center" gap={GAP} className={styles.grid}>
        <TempoInput />
        <TransportControls
          isPlaying={isPlaying}
          togglePlayPause={togglePlayPause}
          stop={stop}
        />
        <MetronomeClick />
      </Flex>
      <span className={styles.title}>Transport</span>
    </Flex>
  );
};

export default TempoTransportPanel;
