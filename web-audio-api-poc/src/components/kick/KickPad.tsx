import { Button, Knob, Slider } from "@cutoff/audio-ui-react";
import classNames from "classnames";
import { controlPanelStyles } from "../ControlPanel";

interface KickPadProps {
  tone: number;
  setTone: (value: number) => void;
  decay: number;
  setDecay: (value: number) => void;
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
 * Kick pad UI: Volume slider + Tone/Decay knobs + trigger button. Pure
 * presentation over whatever state it's given — {@link useKickVoice}
 * supplies it, currently only used by `StepSequencer`, which also
 * schedules that same instance's `trigger` for step playback.
 */
const KickPad = ({
  tone,
  setTone,
  decay,
  setDecay,
  volume,
  setVolume,
  pressed,
  setPressed,
  trigger,
  selected,
  onSelect,
}: KickPadProps) => {
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
            min={30}
            max={120}
            size="small"
            value={tone}
            onChange={(e) => setTone(e.value)}
            label="Tone"
          />
          <Knob
            variant="plainCap"
            min={0.1}
            max={1}
            size="small"
            value={decay}
            onChange={(e) => setDecay(e.value)}
            label="Decay"
          />
        </div>
      </div>
      <Button
        label="Kick"
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

export default KickPad;
