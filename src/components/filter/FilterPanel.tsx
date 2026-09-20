import { CycleButton, Knob } from "@cutoff/audio-ui-react";
import { css } from "@linaria/core";
import { useFilterBus } from "./useFilterBus";
import { FILTER_MODE_OPTIONS, type FilterMode } from "../../lib/masterBus";
import { Flex, Space } from "antd";
import { LABELED_SMALL_KNOB_HEIGHT_UNITS } from "../ControlPanel";

const FILTER_MODE_OPTIONS_LIST = Object.values(FILTER_MODE_OPTIONS);

const styles = {
  grid: css`
    display: grid;
    align-items: center;
    justify-items: center;
    gap: calc(var(--audioui-unit) / 4) calc(var(--audioui-unit) / 2);
    padding: calc(var(--audioui-unit) / 4) calc(var(--audioui-unit) / 2);
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

/**
 * Master filter panel: Cutoff, Resonance, Env Amount, and Mode (HP/LP/BP)
 * in a 2x2 grid. Sits on the mix as a whole (see `lib/masterBus.ts` for
 * the shared `Tone.Filter` every voice's output runs through), between
 * the Transport and Master panels.
 */
const FilterPanel = () => {
  const {
    cutoff,
    setCutoff,
    minCutoff,
    maxCutoff,
    resonance,
    setResonance,
    minResonance,
    maxResonance,
    mode,
    setMode,
    envAmount,
    setEnvAmount,
  } = useFilterBus();

  return (
    <Flex vertical align={"center"} gap={2}>
      <div className={styles.grid}>
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
            min={-1}
            max={1}
            value={envAmount}
            bipolar={true}
            onChange={(rotation) => setEnvAmount(rotation.value)}
            label="Env"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />

          <CycleButton
            size="small"
            label="Mode"
            options={FILTER_MODE_OPTIONS_LIST}
            value={mode}
            onChange={(rotation) => setMode(rotation.value as FilterMode)}
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
        </Space>
      </div>
      <span className={styles.title}>Filter</span>
    </Flex>
  );
};

export default FilterPanel;
