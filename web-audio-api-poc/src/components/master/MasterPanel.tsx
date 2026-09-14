import { Button, Knob } from "@cutoff/audio-ui-react";
import { css } from "@linaria/core";
import { controlPanelStyles } from "../ControlPanel";
import { useMasterBus } from "./useMasterBus";

const styles = {
  wrapper: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  `,

  title: css`
    font-size: 11px;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,
};

/**
 * Master bus panel: overall Volume slider + a Drive knob with its own
 * on/off toggle, sitting on the mix as a whole rather than any one
 * instrument — see `lib/masterBus.ts` for the shared Gain/Distortion chain
 * every voice's output feeds into. Same Slider/Knob/Button layout as the
 * drum pads (`controlPanelStyles`) so it reads as one more channel strip
 * alongside them, just for the master bus instead of one voice.
 */
const MasterPanel = () => {
  const {
    volume,
    setVolume,
    distortion,
    setDistortion,
    distortionOn,
    setDistortionOn,
  } = useMasterBus();

  return (
    <div className={styles.wrapper}>
      <div className={controlPanelStyles.panel}>
        <div className={controlPanelStyles.controlsRow}>
          <div className={controlPanelStyles.knobColumn}>
            <Knob
              variant="plainCap"
              min={0}
              max={1}
              size="small"
              value={distortion}
              onChange={(e) => setDistortion(e.value)}
              label="Drive"
            />
            <Button
              latch
              label="Drive"
              size="xsmall"
              value={distortionOn}
              onChange={(e) => setDistortionOn(e.value)}
            />
          </div>
          <Knob
            min={0}
            max={100}
            variant="plainCap"
            step={1}
            size="xlarge"
            value={volume}
            onChange={(e) => setVolume(e.value)}
            label="Volume"
            unit="%"
            valueAsLabel="interactive"
          />
        </div>
      </div>
      <span className={styles.title}>Master</span>
    </div>
  );
};

export default MasterPanel;
