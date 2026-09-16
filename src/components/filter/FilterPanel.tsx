import { CycleButton, Knob } from "@cutoff/audio-ui-react";
import { css } from "@linaria/core";
import { type FilterMode, useFilterBus } from "./useFilterBus";
import { Space } from "antd";
import { LABELED_SMALL_KNOB_HEIGHT_UNITS } from "../ControlPanel";

const MODE_OPTIONS = [
  { value: "lowpass", label: "LP" },
  { value: "bandpass", label: "BP" },
  { value: "highpass", label: "HP" },
];

const styles = {
  wrapper: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  `,

  grid: css`
    display: grid;
    grid-template-columns: repeat(2, auto);
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
 *
 * No Keyboard Tracking control: this is a drum machine with no per-step
 * pitch or velocity, so a "tracking" knob could only ever apply the same
 * fixed offset on every hit — indistinguishable from just setting a
 * different Cutoff. See `masterBus.ts` for the fuller reasoning.
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
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        <Space>
          <Knob
            variant="plainCap"
            size="large"
            min={minCutoff}
            max={maxCutoff}
            value={cutoff}
            onChange={(e) => setCutoff(e.value)}
            label="Cutoff"
          />
          <Space vertical>
            <Knob
              variant="plainCap"
              size="small"
              min={minResonance}
              max={maxResonance}
              value={resonance}
              onChange={(e) => setResonance(e.value)}
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
              onChange={(e) => setEnvAmount(e.value)}
              label="Env"
              labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
            />
          </Space>
        </Space>
        <CycleButton
          size="small"
          label={MODE_OPTIONS.find((o) => o.value === mode)?.label ?? "Mode"}
          options={MODE_OPTIONS}
          value={mode}
          onChange={(e) => setMode(e.value as FilterMode)}
          labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
        />
      </div>
      <span className={styles.title}>Filter</span>
    </div>
  );
};

export default FilterPanel;
