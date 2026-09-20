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

interface HiHatOpenPadProps {
  trackNumber: number;
  tone: number;
  setTone: (value: number) => void;
  decay: number;
  setDecay: (value: number) => void;
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
 * Open hi-hat pad UI: Tone/Decay knobs, Volume slider + Pan knob +
 * Mute/Solo, and the trigger button. Pure presentation over whatever
 * state it's given — {@link useHiHatOpenVoice} supplies it, currently
 * only used by `StepSequencer`, which also schedules that same instance's
 * `trigger` for step playback.
 */
const HiHatOpenPad = ({
  trackNumber,
  tone,
  setTone,
  decay,
  setDecay,
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
}: HiHatOpenPadProps) => {
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
      <Flex align="center">
        <Knob
          variant="plainCap"
          min={3000}
          max={10000}
          size="small"
          value={tone}
          onChange={(rotation) => setTone(rotation.value)}
          label="Tone"
        />
        <Knob
          variant="plainCap"
          min={0.2}
          max={1}
          size="small"
          value={decay}
          onChange={(rotation) => setDecay(rotation.value)}
          label="Decay"
        />
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
        label={`OH${trackNumber}`}
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

export default HiHatOpenPad;
