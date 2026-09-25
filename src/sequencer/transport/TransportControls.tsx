import { css } from "@linaria/core";
import { Button, Space } from "antd";
import { PlayBevIcon } from "../../icons/transport/PlayBevIcon";
import { PauseBevIcon } from "../../icons/transport/PauseBevIcon";
import { StopBevIcon } from "../../icons/transport/StopBevIcon";

const TRANSPORT_ICON_SIZE = 32;

const styles = {
  // align-self: stretch only takes effect on an item whose cross-size is
  // auto — antd's own Button/Space CSS sets an explicit height (e.g. via
  // --ant-control-height), which disqualifies it from stretching even
  // though that height isn't literally what we want. height: auto here
  // clears antd's explicit value so stretch can take over; height: 100%
  // would NOT work for this — a percentage still counts as "explicit" for
  // this check even when it fails to resolve, so it blocks stretch the
  // same way antd's own fixed height does.
  space: css`
    align-self: stretch !important;
    height: auto !important;
    border: 1px solid var(--accent-border);
    padding-inline: 8px;
    border-radius: 8px !important;

    .ant-space-item {
      display: flex;
      align-items: stretch;
      align-self: stretch !important;
      height: auto !important;
    }
  `,

  button: css`
    background: calc(var(--accent) / 2) !important;
    border: none !important;
    align-self: stretch !important;
    height: auto !important;
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
    <Space className={styles.space}>
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
