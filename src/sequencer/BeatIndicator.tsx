import { css } from "@linaria/core";
import classNames from "classnames";
import { useBeatPulse } from "./useBeatPulse";
import { Flex } from "antd";

const styles = {
  row: css`
    border: 1px solid var(--accent-border);
    padding: 8px;
    border-radius: 8px;
  `,

  rowClickable: css`
    cursor: pointer;
  `,

  dot: css`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid var(--accent-border);
    background: black;
    transition: background 0.05s ease-out;
  `,

  unmuted: css`
    border: 1px solid var(--contrast-1);
  `,

  dotActive: css`
    background: var(--accent);
  `,
  dotActiveUnmuted: css`
    border: 1px solid var(--contrast-1);
    background: var(--contrast-1);
  `,
};

const GAP = "calc(var(--audioui-unit) / 8)";

interface BeatIndicatorProps {
  /**
   * When provided, this indicator doubles as the metronome click's
   * mute/unmute toggle (replacing `MetronomeClick`'s old On/Off button):
   * a simple bordered outline at rest while muted, filled `--contrast-1`
   * while unmuted, clicking flips it. Omit both for a purely visual,
   * non-interactive pulse (e.g. `TempoTransportPanel`'s own instance).
   */
  muted?: boolean;
  onToggleMute?: () => void;
}

/**
 * Minimal visual metronome: two dots, one per alternating beat (see
 * `useBeatPulse.ts`). Whichever dot the current beat lands on flashes
 * `--accent` briefly; the other stays at its resting look. A tempo pulse
 * to glance at, not a bar-position readout — deliberately doesn't track
 * all 4 beats of the bar.
 */
const BeatIndicator = ({ muted, onToggleMute }: BeatIndicatorProps) => {
  const { pulse, flash } = useBeatPulse();

  return (
    <Flex
      align="center"
      justify="center"
      gap={GAP}
      className={classNames(
        styles.row,
        onToggleMute && styles.rowClickable,
        muted === false && styles.unmuted,
      )}
      onClick={onToggleMute}
    >
      {[1, 2].map((i) => (
        <div
          key={i}
          className={classNames(
            styles.dot,
            flash && pulse === i && styles.dotActive,
            flash && pulse === i && muted === false && styles.dotActiveUnmuted,
          )}
        />
      ))}
    </Flex>
  );
};

export default BeatIndicator;
