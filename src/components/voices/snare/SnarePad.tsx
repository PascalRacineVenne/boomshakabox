import { Knob, Slider } from "@cutoff/audio-ui-react";
import TriggerButton from "../../shared/TriggerButton";
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
} from "../../shared/ControlPanel";
import KnobSlot from "../../shared/KnobSlot";
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
  muted,
  setMuted,
  soloed,
  setSolo,
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
      <Flex gap={4}>
        <Flex vertical align="center" gap={4}>
          <Knob
            variant="plainCap"
            min={SNARE_TONE_MIN}
            max={SNARE_TONE_MAX}
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
            min={SNARE_SNAPPY_MIN}
            max={SNARE_SNAPPY_MAX}
            size="small"
            value={snappy}
            onChange={(rotation) => setSnappy(rotation.value)}
            label="Snap"
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
      <TriggerButton
        label={`SN${trackNumber}`}
        pressed={pressed}
        setPressed={setPressed}
        trigger={trigger}
      />
    </Flex>
  );
};

export default SnarePad;
