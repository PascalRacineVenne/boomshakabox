import { css } from "@linaria/core";
import { Collapse, Flex, Slider } from "antd";
import { STEP_COUNT } from "./useStepSequencer";

const GROUP_SIZE = 4;
const GAP = 4;
const SLIDER_HEIGHT = 100;
const STEP_WIDTH = 50;

const styles = {
  group: css`
    padding-right: 16px;
  `,

  collapse: css`
    width: fit-content;

    .ant-collapse-header {
      padding: 0 0 4px !important;
      align-items: center !important;
    }
    .ant-collapse-expand-icon {
      color: var(--contrast-1) !important;
    }
    .ant-collapse-title {
      font-size: 11px !important;
      color: var(--text) !important;
      text-align: left !important;
    }
    .ant-collapse-body {
      padding: 0 !important;
    }
  `,

  slider: css`
    margin: 0 !important;

    /* Velocity is inert for a step that isn't active, but the rail (the
       full 0-100 range) stays at full visibility either way — it's the
       one reference line every slider always needs, disabled or not.
       Without this, a disabled slider is just a faint dot with nothing
       to show it's even a slider. Only the track/handle (the CURRENT
       value, which matters less when disabled) get greyed down. */
    &.ant-slider-disabled {
      .ant-slider-rail {
        background-color: var(--border) !important;
      }
      .ant-slider-track {
        background-color: var(--border) !important;
      }
      .ant-slider-handle::after {
        box-shadow: 0 0 0 2px var(--border) !important;
      }
    }

    .ant-slider-rail {
      background-color: var(--accent) !important;
    }
    .ant-slider-track {
      background-color: var(--contrast-1) !important;
    }
    .ant-slider-handle::after {
      box-shadow: 0 0 0 2px var(--contrast-1) !important;
    }
    &:hover .ant-slider-handle:not(.ant-slider-handle-disabled)::after,
    .ant-slider-handle:hover::after,
    .ant-slider-handle:active::after,
    .ant-slider-handle:focus::after {
      box-shadow: 0 0 0 2px var(--contrast-1) !important;
      outline-color: rgba(
        77,
        240,
        176,
        0.2
      ) !important; /* --contrast-1 at ~20% alpha */
    }
  `,
};

interface VelocityRowProps {
  active: boolean[];
  velocities: number[];
  onVelocityChange: (stepIndex: number, velocity: number) => void;
}

const VelocityRow = ({
  active,
  velocities,
  onVelocityChange,
}: VelocityRowProps) => {
  const groupCount = STEP_COUNT / GROUP_SIZE;

  return (
    <Collapse
      ghost
      size="small"
      className={styles.collapse}
      items={[
        {
          key: "velocity",
          label: "Velocity",
          children: (
            <Flex gap={GAP}>
              {Array.from({ length: groupCount }, (_, groupIndex) => (
                <Flex key={groupIndex} gap={GAP} className={styles.group}>
                  {Array.from({ length: GROUP_SIZE }, (_, i) => {
                    const stepIndex = groupIndex * GROUP_SIZE + i;
                    return (
                      <Slider
                        key={stepIndex}
                        min={0}
                        max={100}
                        step={1}
                        orientation="vertical"
                        className={styles.slider}
                        style={{
                          height: SLIDER_HEIGHT,
                          width: STEP_WIDTH,
                        }}
                        value={velocities[stepIndex]}
                        onChange={(value) =>
                          onVelocityChange(stepIndex, value)
                        }
                        disabled={!active[stepIndex]}
                      />
                    );
                  })}
                </Flex>
              ))}
            </Flex>
          ),
        },
      ]}
    />
  );
};

export default VelocityRow;
