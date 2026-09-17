import { Button, Knob, Slider } from "@cutoff/audio-ui-react";
import classNames from "classnames";
import { controlPanelStyles, formatPan } from "../ControlPanel";

interface HiTomPadProps {
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
        min={-100}
        max={100}
        step={1}
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
          min={0}
          max={100}
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
            min={30}
            max={120}
            size="small"
            value={tone}
            onChange={(rotation) => setTone(rotation.value)}
            label="Tone"
          />
          <Knob
            variant="plainCap"
            min={0.1}
            max={1}
            size="small"
            value={decay}
            onChange={(rotation) => setDecay(rotation.value)}
            label="Decay"
          />
        </div>
      </div>
      <Button
        label="Hi Tom"
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
