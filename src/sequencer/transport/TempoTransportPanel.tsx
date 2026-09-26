import { css } from "@linaria/core";
import { Flex } from "antd";
import TempoInput from "./TempoInput";
import TransportControls from "./TransportControls";
import MetronomeClick from "./MetronomeClick";
import { BoomPurpleIcon } from "../../icons/logos/BoomPurpleIcon";

const styles = {
  grid: css`
    align-items: stretch !important;
    padding: calc(var(--audioui-unit) / 8);
    border: 1px solid var(--accent-border);
    border-radius: 8px;
  `,

  icon: css`
    align-self: center;
    height: 50px;
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
        <BoomPurpleIcon className={styles.icon} />
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
