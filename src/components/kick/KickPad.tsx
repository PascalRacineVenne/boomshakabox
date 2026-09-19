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
import {
  KICK_DECAY_MAX,
  KICK_DECAY_MIN,
  KICK_TONE_MAX,
  KICK_TONE_MIN,
} from "./useKickVoice";

interface KickPadProps {
  /** This voice's 1-based position among all tracks — shown on the trigger button, e.g. "1 Kick". */
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

/**
 * Kick pad UI: Volume slider + Tone/Decay knobs + trigger button. Pure
 * presentation over whatever state it's given — {@link useKickVoice}
 * supplies it, currently only used by `StepSequencer`, which also
 * schedules that same instance's `trigger` for step playback.
 */
const KickPad = ({
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
}: KickPadProps) => {
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
        bipolar
        orientation="horizontal"
        valueAsLabel="interactive"
        valueFormatter={formatPan}
        variant="trackless"
        cursorSize="Strip"
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
            min={KICK_TONE_MIN}
            max={KICK_TONE_MAX}
            size="small"
            value={tone}
            onChange={(rotation) => setTone(rotation.value)}
            label="Tone"
          />
          <Knob
            variant="plainCap"
            min={KICK_DECAY_MIN}
            max={KICK_DECAY_MAX}
            size="small"
            value={decay}
            onChange={(rotation) => setDecay(rotation.value)}
            label="Decay"
          />
        </div>
      </div>
      <Button
        label={`BD${trackNumber}`}
        value={pressed}
        size="large"
        onChange={(press) => {
          setPressed(press.value);
          if (press.value) trigger(); // fires on the real press, not on the release toggling back to false
        }}
      />
    </div>
  );
};

export default KickPad;
