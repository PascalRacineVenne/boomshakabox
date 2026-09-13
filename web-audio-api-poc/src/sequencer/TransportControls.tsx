import { css } from "@linaria/core";
import { useState } from "react";
import { Button, Space } from "antd";
import { CaretRightOutlined, StopOutlined } from "@ant-design/icons";
import * as Tone from "tone";

const styles = {
  button: css`
    background: calc(var(--accent) / 2);
    border: 1px solid var(--accent-border);
  `,
};

/**
 * Play/Stop for `Tone.getTransport()` — the shared clock any future
 * `Tone.Sequence` step grid will schedule against. Plain AntD per the
 * sequencer plan: transport is a utility control, not an expressive
 * performance control like the drum trigger pads, so it doesn't need the
 * audio-ui-react look.
 */
const TransportControls = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStart = async () => {
    // Required by browser autoplay policy — must run in direct response to
    // a user gesture, same as every other trigger in this project.
    await Tone.start();
    Tone.getTransport().start();
    setIsPlaying(true);
  };

  const handleStop = () => {
    Tone.getTransport().stop();
    setIsPlaying(false);
  };

  return (
    <Space>
      <Button
        className={styles.button}
        type={isPlaying ? "default" : "primary"}
        icon={
          <CaretRightOutlined
            style={{
              color: "var(--accent)",
            }}
          />
        }
        onClick={handleStart}
        disabled={isPlaying}
        aria-label="Start"
      />
      <Button
        className={styles.button}
        danger={isPlaying}
        icon={
          <StopOutlined
            style={{
              color: "var(--accent)",
            }}
          />
        }
        onClick={handleStop}
        disabled={!isPlaying}
        aria-label="Stop"
      />
    </Space>
  );
};

export default TransportControls;
