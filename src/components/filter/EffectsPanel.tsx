import { Knob } from "@cutoff/audio-ui-react";
import { css } from "@linaria/core";
import { useEffectsBus } from "./useEffectsBus";
import { Flex, Space } from "antd";
import { LABELED_SMALL_KNOB_HEIGHT_UNITS } from "../ControlPanel";

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
 * Effects bus panel: Cutoff, Resonance, and Drive — the three live params
 * `useEffectsBus` currently exposes for the Moog-ladder-style chain living
 * in `lib/effectsBus.ts` (Distortion -> Filter(rolloff: -24) -> Compressor
 * -> Limiter). No Mode or Env Amount, unlike the original `FilterPanel` —
 * this bus's controls will grow/change as whatever's in `effectsBus.ts`
 * does. Sits in the live master bus after `FilterPanel`'s filter (see
 * `lib/masterBus.ts`).
 */
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
            min={0}
            max={1}
            value={drive}
            onChange={(rotation) => setDrive(rotation.value)}
            label="Drive"
            labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
          />
        </Space>
      </div>
      <span className={styles.title}>Effects</span>
    </Flex>
  );
};

export default EffectsPanel;
