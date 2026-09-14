import { css } from "@linaria/core";
import classNames from "classnames";
import { useBeatPulse } from "./useBeatPulse";

const styles = {
  row: css`
    display: flex;
    gap: calc(var(--audioui-unit) / 8);
    align-items: center;
    justify-content: center;
  `,

  dot: css`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid var(--accent-border);
    background: transparent;
    transition: background 0.05s ease-out;
  `,

  dotActive: css`
    background: var(--accent);
  `,
};

/**
 * Minimal visual metronome: two dots, one per alternating beat (see
 * `useBeatPulse.ts`). Whichever dot the current beat lands on flashes
 * `--accent` briefly; the other stays a transparent outline. A tempo pulse
 * to glance at, not a bar-position readout — deliberately doesn't track
 * all 4 beats of the bar.
 */
const BeatIndicator = () => {
  const { pulse, flash } = useBeatPulse();

  return (
    <div className={styles.row}>
      {[1, 2].map((i) => (
        <div
          key={i}
          className={classNames(
            styles.dot,
            flash && pulse === i && styles.dotActive,
          )}
        />
      ))}
    </div>
  );
};

export default BeatIndicator;
