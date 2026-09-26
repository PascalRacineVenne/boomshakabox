import { Knob } from "@cutoff/audio-ui-react";
import { css } from "@linaria/core";
import { useEffectsBus } from "./useEffectsBus";
import { Flex, Space } from "antd";
import { LABELED_SMALL_KNOB_HEIGHT_UNITS } from "../shared/ControlPanel";

const styles = {
  grid: css`
    gap: calc(var(--audioui-unit) / 4) calc(var(--audioui-unit) / 2);
    padding: calc(var(--audioui-unit) / 8);
    border: 1px solid var(--accent-border);
    border-radius: 8px;
  `,

  title: css`
    font-size: 11px;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,
};

const EffectsPanel = () => {
  const {
    cutoff,
    setCutoff,
    minCutoff,
    maxCutoff,
    resonance,
    setResonance,
    minResonance,
    maxResonance,
    drive,
    setDrive,
  } = useEffectsBus();

  return (
    <Flex vertical align="center" gap={2}>
      <Flex align="center" justify="center" className={styles.grid}>
        <Space>
          <Knob
            variant="plainCap"
            size="small"
            min={minCutoff}
            max={maxCutoff}
            value={cutoff}
            onChange={(rotation) => setCutoff(rotation.value)}
            label="Cutoff"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
          <Knob
            variant="plainCap"
            size="small"
            min={minResonance}
            max={maxResonance}
            value={resonance}
            onChange={(rotation) => setResonance(rotation.value)}
            label="Res"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
          <Knob
            variant="plainCap"
            size="small"
            min={0}
            max={1}
            value={drive}
            onChange={(rotation) => setDrive(rotation.value)}
            label="Drive"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
          <Knob
            variant="plainCap"
            size="small"
            min={0}
            max={1}
            value={0}
            // onChange={(rotation) => setVerb(rotation.value)}
            label="Verb"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
          <Knob
            variant="plainCap"
            size="small"
            min={0}
            max={1}
            value={0}
            // onChange={(rotation) => setDelay(rotation.value)}
            label="Delay"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
        </Space>
        {/* <span className={styles.title}>Effects</span> */}
      </Flex>
    </Flex>
  );
};

export default EffectsPanel;
