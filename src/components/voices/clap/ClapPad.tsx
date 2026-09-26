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
  CLAP_DECAY_MAX,
  CLAP_DECAY_MIN,
  CLAP_FATNESS_MAX,
  CLAP_FATNESS_MIN,
  CLAP_PUNCH_MAX,
  CLAP_PUNCH_MIN,
  CLAP_SNAP_MAX,
  CLAP_SNAP_MIN,
  CLAP_TONE_MAX,
  CLAP_TONE_MIN,
} from "./useClapVoice";

interface ClapPadProps {
  trackNumber: number;
  tone: number;
  setTone: (value: number) => void;
  punch: number;
  setPunch: (value: number) => void;
  decay: number;
  setDecay: (value: number) => void;
  fatness: number;
  setFatness: (value: number) => void;
  snap: number;
  setSnap: (value: number) => void;
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
  sequencerHit?: boolean;
}

const ClapPad = ({
  trackNumber,
  tone,
  setTone,
  punch,
  setPunch,
  decay,
  setDecay,
  fatness,
  setFatness,
  snap,
  setSnap,
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
  sequencerHit,
}: ClapPadProps) => {
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
            min={CLAP_TONE_MIN}
            max={CLAP_TONE_MAX}
            size="small"
            value={tone}
            onChange={(rotation) => setTone(rotation.value)}
            label="Tone"
            valueAsLabel="interactive"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
          <Knob
            variant="plainCap"
            min={CLAP_DECAY_MIN}
            max={CLAP_DECAY_MAX}
            size="small"
            value={decay}
            onChange={(rotation) => setDecay(rotation.value)}
            label="Decay"
            valueAsLabel="interactive"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
          <Knob
            variant="plainCap"
            min={CLAP_FATNESS_MIN}
            max={CLAP_FATNESS_MAX}
            size="small"
            value={fatness}
            onChange={(rotation) => setFatness(rotation.value)}
            label="Fat"
            valueAsLabel="interactive"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
        </Flex>
        <Flex vertical align="center" gap={4}>
          <Knob
            variant="plainCap"
            min={CLAP_PUNCH_MIN}
            max={CLAP_PUNCH_MAX}
            size="small"
            value={punch}
            onChange={(rotation) => setPunch(rotation.value)}
            label="Punch"
            valueAsLabel="interactive"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
          <Knob
            variant="plainCap"
            min={CLAP_SNAP_MIN}
            max={CLAP_SNAP_MAX}
            size="small"
            value={snap}
            onChange={(rotation) => setSnap(rotation.value)}
            label="Snap"
            valueAsLabel="interactive"
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
        label={`CP${trackNumber}`}
        pressed={pressed}
        setPressed={setPressed}
        trigger={trigger}
        sequencerHit={sequencerHit}
      />
    </Flex>
  );
};

export default ClapPad;
