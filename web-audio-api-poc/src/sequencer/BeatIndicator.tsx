import { css } from "@linaria/core";
import { useBeatPulse } from "./useBeatPulse";
import classNames from "classnames";

const styles = {
  row: css`
    display: flex;
    gap: calc(var(--audioui-unit) / 4);
    align-items: center;
    justify-content: center;
  `,

  dot: css`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid var(--accent-border);
    background: transparent;
    transition: background 0.05s ease-out;
  `,

  dotDownbeat: css`
    width: 16px;
    height: 16px;
  `,

  dotActive: css`
    background: var(--accent);
  `,
};

/**
 * Visual metronome: flashes each quarter note, one dot per beat of the bar
 * (4/4 assumed, matching `Tone.Transport`'s default time signature). The
 * downbeat (beat 1) renders slightly larger so the bar boundary reads at a
 * glance, the way a hardware drum machine's beat LEDs do.
 */
const BeatIndicator = () => {
  const { beat, flash } = useBeatPulse();

  return (
    <div className={styles.row}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={classNames(
            styles.dot,
            i === 0 && styles.dotDownbeat,
            flash && beat === i && styles.dotActive,
          )}
        />
      ))}
    </div>
  );
};

export default BeatIndicator;
