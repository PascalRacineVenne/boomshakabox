import { Button, Knob, Slider } from "@cutoff/audio-ui-react";
import classNames from "classnames";
import { Flex } from "antd";
import {
  controlPanelStyles,
  formatPan,
  PANNING_L,
  PANNING_R,
  VOLUME_MAX,
  VOLUME_MIN,
} from "../ControlPanel";
import {
  KICK2_CLICK_MAX,
  KICK2_CLICK_MIN,
  KICK2_FATNESS_MAX,
  KICK2_FATNESS_MIN,
  KICK2_LENGTH_MAX,
  KICK2_LENGTH_MIN,
  KICK2_PITCH_MAX,
  KICK2_PITCH_MIN,
  KICK2_PUNCH_MAX,
  KICK2_PUNCH_MIN,
} from "./useKick2Voice";

interface KickPad2Props {
  /** This voice's 1-based position among all tracks — shown on the trigger button, e.g. "BD2 1". */
  trackNumber: number;
  pitch: number;
  setPitch: (value: number) => void;
  punch: number;
  setPunch: (value: number) => void;
  length: number;
  setLength: (value: number) => void;
  click: number;
  setClick: (value: number) => void;
  fatness: number;
  setFatness: (value: number) => void;
  volume: number;
  setVolume: (value: number) => void;
  pan: number;
  setPan: (value: number) => void;
  muted: boolean;
  setMuted: (value: boolean) => void;
  soloed: boolean;
  setSolo: (value: boolean) => void;
  pressed: boolean;
  setPressed: (value: boolean) => void;
  trigger: (scheduledTime?: number) => void;
  /** Highlights this pad — true when it's the instrument the step grid is currently editing. */
  selected?: boolean;
  /**
   * Called on any real interaction with the panel — pressing the trigger,
   * turning a knob, dragging the slider — so this pad can be selected
   * without necessarily hearing it. See the `onMouseDown` on the outer
   * panel div below: selection is a property of the whole panel, not tied
   * to the trigger button's own onChange.
   */
  onSelect?: () => void;
}

/**
 * BD2 pad UI: Pitch/Punch/Length/Click/Fatness knobs, Volume slider + Pan
 * knob + Mute/Solo, and the trigger button. Pure presentation over
 * whatever state it's given — {@link useKick2Voice} supplies it. Not yet
 * wired into `StepSequencer`.
 */
const KickPad2 = ({
  trackNumber,
  pitch,
  setPitch,
  punch,
  setPunch,
  length,
  setLength,
  click,
  setClick,
  fatness,
  setFatness,
  volume,
  setVolume,
  pan,
  setPan,
  muted,
  setMuted,
  soloed,
  setSolo,
  pressed,
  setPressed,
  trigger,
  selected,
  onSelect,
}: KickPad2Props) => {
  return (
    <Flex
      vertical
      align="center"
      className={classNames(
        controlPanelStyles.panel,
        selected && controlPanelStyles.selected,
      )}
      onMouseDown={onSelect}
    >
      <Flex gap={4}>
        <Flex vertical align="center" gap={4}>
          <Knob
            variant="plainCap"
            min={KICK2_PITCH_MIN}
            max={KICK2_PITCH_MAX}
            size="small"
            value={pitch}
            onChange={(rotation) => setPitch(rotation.value)}
            label="Pitch"
          />
          <Knob
            variant="plainCap"
            min={KICK2_PUNCH_MIN}
            max={KICK2_PUNCH_MAX}
            size="small"
            value={punch}
            onChange={(rotation) => setPunch(rotation.value)}
            label="Punch"
          />
          <Knob
            variant="plainCap"
            min={KICK2_FATNESS_MIN}
            max={KICK2_FATNESS_MAX}
            size="small"
            value={fatness}
            onChange={(rotation) => setFatness(rotation.value)}
            label="Fatness"
          />
        </Flex>
        <Flex vertical align="center" gap={4}>
          <Knob
            variant="plainCap"
            min={KICK2_LENGTH_MIN}
            max={KICK2_LENGTH_MAX}
            size="small"
            value={length}
            onChange={(rotation) => setLength(rotation.value)}
            label="Length"
          />
          <Knob
            variant="plainCap"
            min={KICK2_CLICK_MIN}
            max={KICK2_CLICK_MAX}
            size="small"
            value={click}
            onChange={(rotation) => setClick(rotation.value)}
            label="Click"
          />
        </Flex>
      </Flex>

      <Flex align="center">
        <Flex vertical align="center">
          <Slider
            min={VOLUME_MIN}
            max={VOLUME_MAX}
            step={1}
            size="normal"
            value={volume}
            onChange={(drag) => setVolume(drag.value)}
            orientation="vertical"
            unit="%"
            valueAsLabel="interactive"
          />
        </Flex>
        <Flex vertical>
          <Knob
            variant="plainCap"
            min={PANNING_L}
            max={PANNING_R}
            step={1}
            size="small"
            value={pan}
            onChange={(rotation) => setPan(rotation.value)}
            label="Pan"
            bipolar
            valueAsLabel="interactive"
            valueFormatter={formatPan}
          />
          <Flex gap={4}>
            <Flex
              align="center"
              justify="center"
              className={classNames(
                controlPanelStyles.toggleButton,
                muted && controlPanelStyles.toggleButtonActive,
              )}
              onClick={() => setMuted(!muted)}
            >
              M
            </Flex>
            <Flex
              align="center"
              justify="center"
              className={classNames(
                controlPanelStyles.toggleButton,
                soloed && controlPanelStyles.toggleButtonActive,
              )}
              onClick={() => setSolo(!soloed)}
            >
              S
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Button
        label={`BD${trackNumber}`}
        value={pressed}
        size="large"
        onChange={(press) => {
          setPressed(press.value);
          if (press.value) trigger(); // fires on the real press, not on the release toggling back to false
        }}
      />
    </Flex>
  );
};

export default KickPad2;
