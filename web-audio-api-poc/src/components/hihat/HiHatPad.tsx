import { Button, Knob, Slider } from "@cutoff/audio-ui-react";
import classNames from "classnames";
import { controlPanelStyles } from "../ControlPanel";

interface HiHatPadProps {
  tone: number;
  setTone: (value: number) => void;
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
 * Closed hi-hat pad UI: Volume slider + Tone knob + trigger button. Pure
 * presentation over whatever state it's given — {@link useHiHatVoice}
 * supplies it, currently only used by `StepSequencer`, which also
 * schedules that same instance's `trigger` for step playback.
 */
const HiHatPad = ({
  tone,
  setTone,
  volume,
  setVolume,
  pressed,
  setPressed,
  trigger,
  selected,
  onSelect,
}: HiHatPadProps) => {
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
            min={3000}
            max={10000}
            size="small"
            value={tone}
            onChange={(e) => setTone(e.value)}
            label="Tone"
          />
        </div>
      </div>
      <Button
        label="HH"
        value={pressed}
        size="large"
        onChange={(e) => {
          setPressed(e.value);
          if (e.value) trigger(); // fires on the real press, not on the release toggling back to false
        }}
      />
    </div>
  );
};

export default HiHatPad;
