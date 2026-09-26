import { Knob } from "@cutoff/audio-ui-react";
import { css } from "@linaria/core";
import { Flex } from "antd";
import classNames from "classnames";
import {
  controlPanelStyles,
  LABELED_SMALL_KNOB_HEIGHT_UNITS,
} from "../shared/ControlPanel";
import { useMasterBus } from "./useMasterBus";

const styles = {
  masterBusPanel: css`
    padding: calc(var(--audioui-unit) / 8);
  `,
};

const MasterPanel = () => {
  const { volume, setVolume } = useMasterBus();

  return (
    <Flex vertical align="center" justify="center" gap={2}>
      <Flex
        vertical
        align="center"
        className={classNames(controlPanelStyles.panel, styles.masterBusPanel)}
      >
        <Knob
          min={0}
          max={100}
          variant="plainCap"
          step={1}
          size="small"
          value={volume}
          onChange={(e) => setVolume(e.value)}
          label="MV"
          unit="%"
          valueAsLabel="interactive"
          labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
        />
      </Flex>
    </Flex>
  );
};

export default MasterPanel;
