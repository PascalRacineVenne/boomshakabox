import { Knob } from "@cutoff/audio-ui-react";
import { css } from "@linaria/core";
import { LABELED_SMALL_KNOB_HEIGHT_UNITS } from "../ControlPanel";
import ADSRGraph from "./ADSRGraph";
import { useADSR } from "./useADSR";

const ATTACK_RANGE = { min: 0.001, max: 1 };
const DECAY_RANGE = { min: 0.01, max: 2 };
const SUSTAIN_RANGE = { min: 0, max: 1 };
const RELEASE_RANGE = { min: 0.01, max: 3 };

const styles = {
  wrapper: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  `,

  knobRow: css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: calc(var(--audioui-unit) / 2);
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
 * Attack/Decay/Sustain/Release knobs for `useADSR`'s envelope, with a live
 * `ADSRGraph` preview beneath that redraws as the knobs move. Not yet
 * wired to any drum voice — that relationship (how a voice's own trigger
 * feeds off this envelope) is still an open design question, see
 * `useADSR.ts`.
 */
const ADSRPanel = () => {
  const { attack, decay, sustain, release, setADSR } = useADSR();

  return (
    <div className={styles.wrapper}>
      <div className={styles.knobRow}>
        <Knob
          variant="plainCap"
          size="small"
          min={ATTACK_RANGE.min}
          max={ATTACK_RANGE.max}
          value={attack}
          onChange={(rotation) => setADSR({ attack: rotation.value })}
          label="Attack"
          labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
        />
        <Knob
          variant="plainCap"
          size="small"
          min={DECAY_RANGE.min}
          max={DECAY_RANGE.max}
          value={decay}
          onChange={(rotation) => setADSR({ decay: rotation.value })}
          label="Decay"
          labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
        />
        <Knob
          variant="plainCap"
          size="small"
          min={SUSTAIN_RANGE.min}
          max={SUSTAIN_RANGE.max}
          value={sustain}
          onChange={(rotation) => setADSR({ sustain: rotation.value })}
          label="Sustain"
          labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
        />
        <Knob
          variant="plainCap"
          size="small"
          min={RELEASE_RANGE.min}
          max={RELEASE_RANGE.max}
          value={release}
          onChange={(rotation) => setADSR({ release: rotation.value })}
          label="Release"
          labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
        />
      </div>
      <ADSRGraph
        attack={attack}
        decay={decay}
        sustain={sustain}
        release={release}
      />
      <span className={styles.title}>ADSR</span>
    </div>
  );
};

export default ADSRPanel;
