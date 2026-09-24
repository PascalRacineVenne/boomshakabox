import { css } from "@linaria/core";
import { useState } from "react";
import { Button, Space } from "antd";
import * as Tone from "tone";
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

const TransportControls = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTogglePlayPause = async () => {
    await Tone.start();
    if (isPlaying) {
      Tone.getTransport().pause();
      setIsPlaying(false);
    } else {
      Tone.getTransport().start();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    Tone.getTransport().stop();
    setIsPlaying(false);
  };

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
        onClick={handleTogglePlayPause}
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
        onClick={handleStop}
        aria-label="Stop"
      />
    </Space>
  );
};

export default TransportControls;
