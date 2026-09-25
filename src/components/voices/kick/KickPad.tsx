import { Knob, Slider } from "@cutoff/audio-ui-react";
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
import TriggerButton from "../../shared/TriggerButton";
import {
  KICK_CLICK_MAX,
  KICK_CLICK_MIN,
  KICK_FATNESS_MAX,
  KICK_FATNESS_MIN,
  KICK_LENGTH_MAX,
  KICK_LENGTH_MIN,
  KICK_PITCH_MAX,
  KICK_PITCH_MIN,
  KICK_PUNCH_MAX,
  KICK_PUNCH_MIN,
} from "./useKickVoice";

interface KickPadProps {
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
  selected?: boolean;
  onSelect?: () => void;
}

const KickPad = ({
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
}: KickPadProps) => {
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
      <Flex>
        <Flex vertical align="center" gap={4}>
          <Knob
            variant="plainCap"
            min={KICK_PITCH_MIN}
            max={KICK_PITCH_MAX}
            size="small"
            value={pitch}
            onChange={(rotation) => setPitch(rotation.value)}
            label="Pitch"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
          <Knob
            variant="plainCap"
            min={KICK_LENGTH_MIN}
            max={KICK_LENGTH_MAX}
            size="small"
            value={length}
            onChange={(rotation) => setLength(rotation.value)}
            label="Decay"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
          <Knob
            variant="plainCap"
            min={KICK_FATNESS_MIN}
            max={KICK_FATNESS_MAX}
            size="small"
            value={fatness}
            onChange={(rotation) => setFatness(rotation.value)}
            label="Fat"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
        </Flex>
        <Flex vertical align="center" gap={4}>
          <Knob
            variant="plainCap"
            min={KICK_PUNCH_MIN}
            max={KICK_PUNCH_MAX}
            size="small"
            value={punch}
            onChange={(rotation) => setPunch(rotation.value)}
            label="Punch"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
          <Knob
            variant="plainCap"
            min={KICK_CLICK_MIN}
            max={KICK_CLICK_MAX}
            size="small"
            value={click}
            onChange={(rotation) => setClick(rotation.value)}
            label="Click"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
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
        label={`BD${trackNumber}`}
        pressed={pressed}
        setPressed={setPressed}
        trigger={trigger}
      />
    </Flex>
  );
};

export default KickPad;
