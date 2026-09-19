import { Button, Knob, Slider } from "@cutoff/audio-ui-react";
import classNames from "classnames";
import {
  controlPanelStyles,
  formatPan,
  PANNING_L,
  PANNING_R,
  VOLUME_MAX,
  VOLUME_MIN,
} from "../ControlPanel";
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
  pressed,
  setPressed,
  trigger,
  selected,
  onSelect,
}: HiTomPadProps) => {
  return (
    <div
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
        valueAsLabel="interactive"
        valueFormatter={formatPan}
        variant="trackless"
        cursorSize="Strip"
        bipolar
        orientation="horizontal"
      />
      <div className={controlPanelStyles.controlsRow}>
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
        <div className={controlPanelStyles.knobColumn}>
          <Knob
            variant="plainCap"
            min={TONE_MIN}
            max={TONE_MAX}
            size="small"
            value={tone}
            onChange={(rotation) => setTone(rotation.value)}
            label="Tone"
          />
          <Knob
            variant="plainCap"
            min={DECAY_MIN}
            max={DECAY_MAX}
            size="small"
            value={decay}
            onChange={(rotation) => setDecay(rotation.value)}
            label="Decay"
          />
        </div>
      </div>
      <Button
        label={`HT${trackNumber}`}
        value={pressed}
        size="large"
        onChange={(press) => {
          setPressed(press.value);
          if (press.value) trigger();
        }}
      />
    </div>
  );
};

export default HiTomPad;
