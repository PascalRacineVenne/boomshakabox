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
  SNARE_SNAPPY_MAX,
  SNARE_SNAPPY_MIN,
  SNARE_TONE_MAX,
  SNARE_TONE_MIN,
} from "./useSnareVoice";

interface SnarePadProps {
  trackNumber: number;
  tone: number;
  setTone: (value: number) => void;
  snappy: number;
  setSnappy: (value: number) => void;
  volume: number;
  setVolume: (value: number) => void;
  pan: number;
  setPan: (value: number) => void;
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
 * Snare pad UI: Volume slider + Tone/Snappy knobs + trigger button. Pure
 * presentation over whatever state it's given — {@link useSnareVoice}
 * supplies it, currently only used by `StepSequencer`, which also
 * schedules that same instance's `trigger` for step playback.
 */
const SnarePad = ({
  trackNumber,
  tone,
  setTone,
  snappy,
  setSnappy,
  volume,
  setVolume,
  pan,
  setPan,
  pressed,
  setPressed,
  trigger,
  selected,
  onSelect,
}: SnarePadProps) => {
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
      <Slider
        min={PANNING_L}
        max={PANNING_R}
        step={1}
        size="small"
        value={pan}
        onChange={(drag) => setPan(drag.value)}
        label="Pan"
        bipolar
        orientation="horizontal"
        valueAsLabel="interactive"
        valueFormatter={formatPan}
        variant="trackless"
        cursorSize="Strip"
      />
      <Flex align="center">
        <Slider
          min={VOLUME_MIN}
          max={VOLUME_MAX}
          step={1}
          size="small"
          value={volume}
          onChange={(drag) => setVolume(drag.value)}
          label="Volume"
          orientation="vertical"
          unit="%"
          valueAsLabel="interactive"
        />
        <Flex vertical align="center">
          <Knob
            variant="plainCap"
            min={SNARE_TONE_MIN}
            max={SNARE_TONE_MAX}
            size="small"
            value={tone}
            onChange={(rotation) => setTone(rotation.value)}
            label="Tone"
          />
          <Knob
            variant="plainCap"
            min={SNARE_SNAPPY_MIN}
            max={SNARE_SNAPPY_MAX}
            size="small"
            value={snappy}
            onChange={(rotation) => setSnappy(rotation.value)}
            label="Snappy"
          />
        </Flex>
      </Flex>
      <Button
        label={`SN${trackNumber}`}
        value={pressed}
        size="large"
        onChange={(press) => {
          setPressed(press.value);
          if (press.value) trigger();
        }}
      />
    </Flex>
  );
};

export default SnarePad;
