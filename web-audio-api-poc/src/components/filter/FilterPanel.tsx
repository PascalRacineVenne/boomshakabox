import { CycleButton, Knob } from "@cutoff/audio-ui-react";
import { css } from "@linaria/core";
import { type FilterMode, useFilterBus } from "./useFilterBus";

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
    grid-template-columns: repeat(3, auto);
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
 * Master filter panel: Cutoff, Resonance, and Mode (HP/LP/BP) on top,
 * Env Amount and Keyboard Tracking underneath — a 2x3 grid, the third
 * cell of the bottom row deliberately left empty. Sits on the mix as a
 * whole (see `lib/masterBus.ts` for the shared `Tone.Filter` every voice's
 * output runs through), between the Master bus and Transport panels.
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
    keyboardTracking,
    setKeyboardTracking,
  } = useFilterBus();

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        <Knob
          variant="plainCap"
          size="small"
          min={minCutoff}
          max={maxCutoff}
          value={cutoff}
          onChange={(e) => setCutoff(e.value)}
          label="Cutoff"
        />
        <Knob
          variant="plainCap"
          size="small"
          min={minResonance}
          max={maxResonance}
          value={resonance}
          onChange={(e) => setResonance(e.value)}
          label="Res"
        />
        <CycleButton
          size="small"
          label={MODE_OPTIONS.find((o) => o.value === mode)?.label ?? "Mode"}
          options={MODE_OPTIONS}
          value={mode}
          onChange={(e) => setMode(e.value as FilterMode)}
        />

        <Knob
          variant="plainCap"
          size="small"
          min={-1}
          max={1}
          value={envAmount}
          onChange={(e) => setEnvAmount(e.value)}
          label="Env Amt"
        />
        <Knob
          variant="plainCap"
          size="small"
          min={0}
          max={1}
          value={keyboardTracking}
          onChange={(e) => setKeyboardTracking(e.value)}
          label="Kbd Trk"
        />
      </div>
      <span className={styles.title}>Filter</span>
    </div>
  );
};

export default FilterPanel;
