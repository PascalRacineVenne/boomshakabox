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
  muted?: boolean;
  onToggleMute?: () => void;
}

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
