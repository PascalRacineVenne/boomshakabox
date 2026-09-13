import { Button, Knob } from "@cutoff/audio-ui-react";
import { useMetronomeClick } from "./useMetronomeClick";
import { css } from "@linaria/core";

const style = {
  container: css`
    display: flex;
    alignitems: center;
  `,
};

/**
 * Controls for the audible metronome click that ticks on every beat (see
 * `useMetronomeClick.ts`): a small vertical "Volume" slider for its level,
 * and a latch "Mute" button, independent of the drum voices' own volume
 * sliders. Pitch is fixed — no Tone knob — the click is meant to be heard,
 * not tuned.
 */
const MetronomeClick = () => {
  const { volume, setVolume, muted, setMuted } = useMetronomeClick();

  return (
    <div className={style.container}>
      <Knob
        min={0}
        max={100}
        step={1}
        value={volume}
        onChange={(e) => setVolume(e.value)}
        label="Click"
        size="small"
        unit="%"
        valueAsLabel="interactive"
      />
      <Button
        latch
        size="small"
        label="Mute"
        value={muted}
        onChange={(e) => setMuted(e.value)}
      />
    </div>
  );
};

export default MetronomeClick;
