import { Button, Knob, Slider } from "@cutoff/audio-ui-react";
import classNames from "classnames";
import { controlPanelStyles } from "../ControlPanel";

interface SnarePadProps {
  tone: number;
  setTone: (value: number) => void;
  snappy: number;
  setSnappy: (value: number) => void;
  volume: number;
  setVolume: (value: number) => void;
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
  tone,
  setTone,
  snappy,
  setSnappy,
  volume,
  setVolume,
  pressed,
  setPressed,
  trigger,
  selected,
  onSelect,
}: SnarePadProps) => {
  return (
    <div
      className={classNames(controlPanelStyles.panel, selected && controlPanelStyles.selected)}
      onMouseDown={onSelect}
    >
      <div className={controlPanelStyles.controlsRow}>
        <Slider
          min={0}
          max={100}
          step={1}
          size="small"
          value={volume}
          onChange={(e) => setVolume(e.value)}
          label="Volume"
          orientation="vertical"
          unit="%"
          valueAsLabel="interactive"
        />
        <div className={controlPanelStyles.knobColumn}>
          <Knob
            variant="plainCap"
            min={100}
            max={300}
            size="small"
            value={tone}
            onChange={(e) => setTone(e.value)}
            label="Tone"
          />
          <Knob
            variant="plainCap"
            min={0}
            max={1}
            size="small"
            value={snappy}
            onChange={(e) => setSnappy(e.value)}
            label="Snappy"
          />
        </div>
      </div>
      <Button
        label="Snare"
        value={pressed}
        size="large"
        onChange={(e) => {
          setPressed(e.value);
          if (e.value) trigger();
        }}
      />
    </div>
  );
};

export default SnarePad;
