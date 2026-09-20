import { Knob } from "@cutoff/audio-ui-react";
import BeatIndicator from "./BeatIndicator";
import { useMetronomeClick } from "./useMetronomeClick";
import { LABELED_SMALL_KNOB_HEIGHT_UNITS } from "../components/ControlPanel";
import { Space } from "antd";

/**
 * Controls for the audible metronome click that ticks on every beat (see
 * `useMetronomeClick.ts`): a small vertical "Volume" slider for its level,
 * independent of the drum voices' own volume sliders. Pitch is fixed — no
 * Tone knob — the click is meant to be heard, not tuned.
 *
 * Mute/unmute lives on the `BeatIndicator` itself now (no separate button):
 * clicking it toggles `muted`, and its resting look — bordered while muted,
 * filled `--contrast-1` while unmuted — doubles as the on/off readout the
 * old Button used to give via its "On"/"Off" label.
 */
const MetronomeClick = () => {
  const { volume, setVolume, muted, setMuted } = useMetronomeClick();

  return (
    <Space>
      <BeatIndicator muted={muted} onToggleMute={() => setMuted(!muted)} />
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
    </Space>
  );
};

export default MetronomeClick;
