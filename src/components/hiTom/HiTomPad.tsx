import { Button, Knob, Slider } from "@cutoff/audio-ui-react";
import classNames from "classnames";
import { Flex } from "antd";
import {
  controlPanelStyles,
  formatPan,
  LABELED_SMALL_KNOB_HEIGHT_UNITS,
  PANNING_L,
  PANNING_R,
  VOLUME_MAX,
  VOLUME_MIN,
} from "../ControlPanel";
import KnobSlot from "../KnobSlot";
import { TONE_MIN, TONE_MAX, DECAY_MIN, DECAY_MAX } from "./useHiTomVoice";

interface HiTomPadProps {
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
  selected?: boolean;
  onSelect?: () => void;
}
const HiTomPad = ({
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
}: HiTomPadProps) => {
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
            min={TONE_MIN}
            max={TONE_MAX}
            size="small"
            value={tone}
            onChange={(rotation) => setTone(rotation.value)}
            label="Tone"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
          <KnobSlot />
          <KnobSlot />
        </Flex>
        <Flex vertical align="center" gap={4}>
          <Knob
            variant="plainCap"
            min={DECAY_MIN}
            max={DECAY_MAX}
            size="small"
            value={decay}
            onChange={(rotation) => setDecay(rotation.value)}
            label="Decay"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
          <KnobSlot />
          <KnobSlot />
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
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
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
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
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
        label={`HT${trackNumber}`}
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

export default HiTomPad;
