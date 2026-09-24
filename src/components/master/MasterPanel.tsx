import { Knob } from "@cutoff/audio-ui-react";
import { css } from "@linaria/core";
import { Flex } from "antd";
import {
  controlPanelStyles,
  LABELED_SMALL_KNOB_HEIGHT_UNITS,
} from "../shared/ControlPanel";
import { useMasterBus } from "./useMasterBus";

const styles = {
  title: css`
    font-size: 11px;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,
};

const MasterPanel = () => {
  const { volume, setVolume } = useMasterBus();

  return (
    <Flex align="center" justify="center" gap={2}>
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
    </Flex>
  );
};

export default MasterPanel;
