import { Knob, Slider } from "@cutoff/audio-ui-react";
import { useMetronomeClick } from "./useMetronomeClick";

/**
 * Controls for the audible metronome click that ticks on every beat (see
 * `useMetronomeClick.ts`) — a "Tone" knob for the click's pitch, and a
 * small vertical "Volume" slider for its level, independent of the drum
 * voices' own volume sliders.
 */
const MetronomeClick = () => {
  const { tone, setTone, minTone, maxTone, volume, setVolume } =
    useMetronomeClick();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <Knob
        variant="plainCap"
        min={minTone}
        max={maxTone}
        value={tone}
        onChange={(e) => setTone(e.value)}
        label="Tone"
      />
      <Slider
        min={0}
        max={100}
        step={1}
        value={volume}
        onChange={(e) => setVolume(e.value)}
        label="Click"
        orientation="vertical"
        size="small"
        unit="%"
        valueAsLabel="interactive"
      />
    </div>
  );
};

export default MetronomeClick;
