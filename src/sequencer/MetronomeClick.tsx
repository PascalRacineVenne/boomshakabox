import { Button, Knob } from "@cutoff/audio-ui-react";
import { useMetronomeClick } from "./useMetronomeClick";
import { LABELED_SMALL_KNOB_HEIGHT_UNITS } from "../components/ControlPanel";
import { Space } from "antd";

/**
 * Controls for the audible metronome click that ticks on every beat (see
 * `useMetronomeClick.ts`): a small vertical "Volume" slider for its level,
 * and an On/Off toggle button, independent of the drum voices' own volume
 * sliders. Pitch is fixed — no Tone knob — the click is meant to be heard,
 * not tuned.
 *
 * The button is lit when the click is actually audible, same convention
 * as the Master/Filter panels' "Drive" toggle — so its `value` binds the
 * inverse of `muted` (`useMetronomeClick` still tracks `muted`, silent by
 * default), and its label switches between "On"/"Off" to match.
 *
 * Deliberately wired via `onClick`, not `onChange`+`latch`: in this
 * library's Button, `onChange`'s own press handling also toggles again on
 * `onMouseEnter` while the pointer is held down globally (it's what lets
 * the step grid's latch buttons "paint" multiple steps in one drag). A
 * real click almost always has a pixel or two of jitter, which re-fires
 * that mouseenter mid-press and toggles a second time, silently
 * cancelling the click. `onClick` is wired independently of that state
 * machine — a plain native click, immune to in-press jitter — so it's the
 * reliable choice for a single on/off toggle like this one.
 */
const MetronomeClick = () => {
  const { volume, setVolume, muted, setMuted } = useMetronomeClick();

  return (
    <Space vertical>
      <Knob
        min={0}
        max={100}
        variant="plainCap"
        step={1}
        value={volume}
        onChange={(rotation) => setVolume(rotation.value)}
        label="Click"
        size="small"
        valueAsLabel="interactive"
        labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
      />
      <Button
        size="small"
        label={muted ? "Off" : "On"}
        value={!muted}
        onClick={() => setMuted(!muted)}
        labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS / 2}
      />
    </Space>
  );
};

export default MetronomeClick;
