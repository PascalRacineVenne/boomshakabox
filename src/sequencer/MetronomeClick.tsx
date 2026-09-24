import { Knob } from "@cutoff/audio-ui-react";
import BeatIndicator from "./BeatIndicator";
import { useMetronomeClick } from "./useMetronomeClick";
import { LABELED_SMALL_KNOB_HEIGHT_UNITS } from "../components/ControlPanel";
import { Space } from "antd";

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
