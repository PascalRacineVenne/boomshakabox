import { Button, Knob } from "@cutoff/audio-ui-react";
import { css } from "@linaria/core";
import { Flex } from "antd";
import {
  controlPanelStyles,
  LABELED_SMALL_KNOB_HEIGHT_UNITS,
} from "../ControlPanel";
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
      <Flex align="center" className={controlPanelStyles.panel}>
        <Knob
          variant="plainCap"
          min={0}
          max={1}
          size="small"
          value={distortion}
          onChange={(e) => setDistortion(e.value)}
          label="Drive"
          labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
        />
        <Button
          latch
          label="ON/OFF"
          size="xsmall"
          value={distortionOn}
          onChange={(e) => setDistortionOn(e.value)}
          labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS / 2}
        />
        <Knob
          min={0}
          max={100}
          variant="plainCap"
          step={1}
          size="small"
          value={volume}
          onChange={(e) => setVolume(e.value)}
          label="Volume"
          unit="%"
          valueAsLabel="interactive"
        />
      </Flex>
      <span className={styles.title}>Master</span>
    </div>
  );
};

export default MasterPanel;
