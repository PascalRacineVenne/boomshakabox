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

/**
 * Play/Pause + Stop for `Tone.getTransport()` — the shared clock the step
 * sequencer schedules against. Plain AntD per the sequencer plan: transport
 * is a utility control, not an expressive performance control like the
 * drum trigger pads, so it doesn't need the audio-ui-react look.
 *
 * Play/Pause is one button whose icon/label flip with `isPlaying`:
 * `Transport.pause()` holds position, so pressing Play again resumes
 * mid-pattern. Stop is a separate button — `Transport.stop()` resets
 * position to 0, which is also what `useStepSequencer` listens for (via
 * the Transport's own "stop" event) to reset its own step counter, so
 * Stop then Play always restarts the pattern from step 1 rather than
 * resuming where it left off.
 */
const TransportControls = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTogglePlayPause = async () => {
    // Required by browser autoplay policy — must run in direct response to
    // a user gesture, same as every other trigger in this project.
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
