import type { CSSProperties, ReactNode } from "react";
import { css } from "@linaria/core";

interface ADSRGraphProps {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  lineStyle?: CSSProperties;
  timeLineStyle?: CSSProperties;
  phaseLineStyle?: CSSProperties;
}

const COORDINATE_HEIGHT = 100;
const COORDINATE_WIDTH = 100;
const SUSTAIN_PHASE_WIDTH = 10;

const INITIAL_TIME_STEP = 1e-6;
const MAX_TIME_STEP = 100;
const MIN_VISIBLE_TIME_RATIO = 1e-2;

const styles = {
  background: css`
    fill: black;
  `,

  envelopeLine: css`
    fill: none;
    stroke: var(--accent);
    stroke-width: 2;
  `,

  timelineStroke: css`
    fill: none;
    stroke: var(--border);
    stroke-width: 1;
  `,

  graph: css`
    width: 300px;
    height: 150px;
    border: 2px solid var(--accent-border);
    border-radius: 8px;
  `,

  phaseLineStroke: css`
    fill: none;
    stroke: var(--accent-border);
    stroke-width: 1;
    stroke-dasharray: 5, 5;
  `,
};

const getPhaseLengths = (
  attack: number,
  decay: number,
  release: number,
): [number, number, number, number] => {
  const totalTime = attack + decay + release;

  const relativeAttack = attack / totalTime;
  const relativeDecay = decay / totalTime;
  const relativeRelease = release / totalTime;

  const remainingWidth = COORDINATE_WIDTH - SUSTAIN_PHASE_WIDTH;
  const absoluteAttack = relativeAttack * remainingWidth;
  const absoluteDecay = relativeDecay * remainingWidth;
  const absoluteRelease = relativeRelease * remainingWidth;

  return [absoluteAttack, absoluteDecay, SUSTAIN_PHASE_WIDTH, absoluteRelease];
};

const linearStrokeTo = (deltaX: number, deltaY: number) =>
  `l ${deltaX} ${deltaY}`;

const exponentialStrokeTo = (deltaX: number, deltaY: number) =>
  `c ${deltaX / 5} ${deltaY / 2} ${deltaX / 2} ${deltaY} ${deltaX} ${deltaY}`;

const generatePath = (
  attack: number,
  decay: number,
  sustain: number,
  release: number,
) => {
  const [attackWidth, decayWidth, sustainWidth, releaseWidth] = getPhaseLengths(
    attack,
    decay,
    release,
  );

  const strokes = [
    `M 0 ${COORDINATE_HEIGHT}`,
    linearStrokeTo(attackWidth, -COORDINATE_HEIGHT),
    exponentialStrokeTo(decayWidth, COORDINATE_HEIGHT * (1 - sustain)),
    linearStrokeTo(sustainWidth, 0),
    exponentialStrokeTo(releaseWidth, COORDINATE_HEIGHT * sustain),
  ];

  return strokes.join(" ");
};

const buildLogTimeSteps = (
  currentTimeStep: number,
  totalTime: number,
): number[] => {
  if (currentTimeStep >= MAX_TIME_STEP || currentTimeStep > totalTime) {
    return [];
  }
  return [
    currentTimeStep,
    ...buildLogTimeSteps(currentTimeStep * Math.E, totalTime),
  ];
};

const renderTimeLines = (
  attack: number,
  decay: number,
  release: number,
  timeLineStyle?: CSSProperties,
): ReactNode[] => {
  const totalTime = attack + decay + release;

  return buildLogTimeSteps(INITIAL_TIME_STEP, totalTime)
    .filter((timeStep) => timeStep / totalTime > MIN_VISIBLE_TIME_RATIO)
    .map((timeStep) => {
      const xPosition = (timeStep / totalTime) * COORDINATE_WIDTH;
      return (
        <line
          key={timeStep}
          x1={xPosition}
          y1={0}
          x2={xPosition}
          y2={COORDINATE_HEIGHT}
          className={styles.timelineStroke}
          style={timeLineStyle}
          vectorEffect="non-scaling-stroke"
        />
      );
    });
};

const renderPhaseLines = (
  attack: number,
  decay: number,
  release: number,
  phaseLineStyle?: CSSProperties,
): ReactNode[] => {
  const phaseWidths = getPhaseLengths(attack, decay, release).slice(0, -1);
  const phaseBoundaryPositions = phaseWidths.reduce<number[]>(
    (positions, phaseWidth) => [
      ...positions,
      (positions.at(-1) ?? 0) + phaseWidth,
    ],
    [],
  );

  return phaseBoundaryPositions.map((xPosition) => (
    <line
      key={xPosition}
      x1={xPosition}
      y1={0}
      x2={xPosition}
      y2={COORDINATE_HEIGHT}
      className={styles.phaseLineStroke}
      style={phaseLineStyle}
      vectorEffect="non-scaling-stroke"
    />
  ));
};

const ADSRGraph = ({
  attack,
  decay,
  sustain,
  release,
  lineStyle,
  timeLineStyle,
  phaseLineStyle,
}: ADSRGraphProps) => {
  return (
    <svg
      className={styles.graph}
      viewBox={`0 0 ${COORDINATE_WIDTH} ${COORDINATE_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <rect
        width={COORDINATE_WIDTH}
        height={COORDINATE_HEIGHT}
        className={styles.background}
      />
      {renderTimeLines(attack, decay, release, timeLineStyle)}
      <path
        d={generatePath(attack, decay, sustain, release)}
        className={styles.envelopeLine}
        style={lineStyle}
        vectorEffect="non-scaling-stroke"
      />
      {renderPhaseLines(attack, decay, release, phaseLineStyle)}
    </svg>
  );
};

export default ADSRGraph;
