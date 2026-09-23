import { Knob } from "@cutoff/audio-ui-react";
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
 * Master bus panel: just the overall Volume knob, sitting on the mix as a
 * whole rather than any one instrument — see `lib/masterBus.ts` for the
 * shared Gain chain every voice's output feeds into. (There used to be a
 * Drive knob + on/off toggle here too — removed once the effects bus's
 * own Drive, `EffectsPanel.tsx`, became the one drive control worth
 * keeping.) Same Knob layout as the drum pads (`controlPanelStyles`) so it
 * reads as one more channel strip alongside them, just for the master bus
 * instead of one voice.
 */
const MasterPanel = () => {
  const { volume, setVolume } = useMasterBus();

  return (
    <div className={styles.wrapper}>
      <Flex align="center" className={controlPanelStyles.panel}>
        <Knob
          min={0}
          max={100}
          variant="plainCap"
          step={1}
          size="small"
          value={volume}
          onChange={(e) => setVolume(e.value)}
          label="Vol"
          unit="%"
          valueAsLabel="interactive"
          labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
        />
      </Flex>
      <span className={styles.title}>Master</span>
    </div>
  );
};

export default MasterPanel;
