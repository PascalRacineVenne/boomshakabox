import { css } from "@linaria/core";
import { Button, Space } from "antd";
import { PlayBevIcon } from "../icons/transport/PlayBevIcon";
import { PauseBevIcon } from "../icons/transport/PauseBevIcon";
import { StopBevIcon } from "../icons/transport/StopBevIcon";

const TRANSPORT_ICON_SIZE = 32;

const styles = {
  button: css`
    background: calc(var(--accent) / 2) !important;
    border: none !important;
  `,
};

interface TransportControlsProps {
  isPlaying: boolean;
  togglePlayPause: () => void;
  stop: () => void;
}

const TransportControls = ({
  isPlaying,
  togglePlayPause,
  stop,
}: TransportControlsProps) => {
  return (
    <Space>
      <Button
        className={styles.button}
        type="primary"
        icon={
          isPlaying ? (
            <PauseBevIcon style={{ fontSize: TRANSPORT_ICON_SIZE }} />
          ) : (
            <PlayBevIcon style={{ fontSize: TRANSPORT_ICON_SIZE }} />
          )
        }
        onClick={togglePlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
      />
      <Button
        className={styles.button}
        icon={
          <StopBevIcon
            style={{
              fontSize: TRANSPORT_ICON_SIZE,
            }}
          />
        }
        onClick={stop}
        aria-label="Stop"
      />
    </Space>
  );
};

export default TransportControls;
