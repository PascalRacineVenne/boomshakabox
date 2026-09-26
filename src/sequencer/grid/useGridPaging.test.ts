import { act, renderHook } from "@testing-library/react";
import { useGridPaging } from "./useGridPaging";
import { MAX_STEPS, STEP_COUNT, TRACK_IDS, type TrackId } from "../sequencerConstants";

const DEFAULT_VELOCITY = 80;

const buildBooleanPattern = (trueIndices: number[] = []): boolean[] => {
  const pattern = Array<boolean>(MAX_STEPS).fill(false);
  trueIndices.forEach((index) => {
    pattern[index] = true;
  });
  return pattern;
};

const buildVelocityPattern = (
  overrides: Record<number, number> = {},
): number[] => {
  const velocities = Array<number>(MAX_STEPS).fill(DEFAULT_VELOCITY);
  Object.entries(overrides).forEach(([index, velocity]) => {
    velocities[Number(index)] = velocity;
  });
  return velocities;
};

const buildPatternsDisplay = (
  overrides: Partial<Record<TrackId, boolean[]>> = {},
): Record<TrackId, boolean[]> =>
  Object.fromEntries(
    TRACK_IDS.map((id) => [id, overrides[id] ?? buildBooleanPattern()]),
  ) as Record<TrackId, boolean[]>;

const buildVelocitiesDisplay = (
  overrides: Partial<Record<TrackId, number[]>> = {},
): Record<TrackId, number[]> =>
  Object.fromEntries(
    TRACK_IDS.map((id) => [id, overrides[id] ?? buildVelocityPattern()]),
  ) as Record<TrackId, number[]>;

describe("useGridPaging", () => {
  test("starts at length 16, range 0, with rangeStart 0", () => {
    // Given
    const patternsDisplay = buildPatternsDisplay();
    const velocitiesDisplay = buildVelocitiesDisplay();

    // When
    const { result } = renderHook(() =>
      useGridPaging({
        patternsDisplay,
        velocitiesDisplay,
        selectedTrack: "kick",
      }),
    );

    // Then
    expect(result.current.length).toBe(16);
    expect(result.current.viewedRange).toBe(0);
    expect(result.current.rangeStart).toBe(0);
  });

  test("clamps viewedRange down to the last valid range when length shrinks", () => {
    // Given
    const patternsDisplay = buildPatternsDisplay();
    const velocitiesDisplay = buildVelocitiesDisplay();
    const { result } = renderHook(() =>
      useGridPaging({
        patternsDisplay,
        velocitiesDisplay,
        selectedTrack: "kick",
      }),
    );
    act(() => {
      result.current.setLength(64);
    });
    act(() => {
      result.current.goToRange(3); // last valid range at length 64
    });
    expect(result.current.viewedRange).toBe(3);

    // When
    act(() => {
      result.current.setLength(16); // only range 0 is valid at length 16
    });

    // Then
    expect(result.current.length).toBe(16);
    expect(result.current.viewedRange).toBe(0);
  });

  test("leaves viewedRange unchanged when the new length still supports it", () => {
    // Given
    const patternsDisplay = buildPatternsDisplay();
    const velocitiesDisplay = buildVelocitiesDisplay();
    const { result } = renderHook(() =>
      useGridPaging({
        patternsDisplay,
        velocitiesDisplay,
        selectedTrack: "kick",
      }),
    );
    act(() => {
      result.current.setLength(64);
    });
    act(() => {
      result.current.goToRange(2);
    });

    // When
    act(() => {
      result.current.setLength(48); // range 2 (steps 32-47) is still valid at length 48
    });

    // Then
    expect(result.current.viewedRange).toBe(2);
  });

  test("slices activePattern/activeVelocities to the first 16-step range by default", () => {
    // Given
    const trueSteps = [0, 5, 15];
    const patternsDisplay = buildPatternsDisplay({
      kick: buildBooleanPattern(trueSteps),
    });
    const velocitiesDisplay = buildVelocitiesDisplay({
      kick: buildVelocityPattern({ 5: 42 }),
    });

    // When
    const { result } = renderHook(() =>
      useGridPaging({
        patternsDisplay,
        velocitiesDisplay,
        selectedTrack: "kick",
      }),
    );

    // Then
    expect(result.current.activePattern).toEqual(
      buildBooleanPattern(trueSteps).slice(0, STEP_COUNT),
    );
    expect(result.current.activeVelocities).toEqual(
      buildVelocityPattern({ 5: 42 }).slice(0, STEP_COUNT),
    );
  });

  test("slices activePattern/activeVelocities to the last 16-step range at max length", () => {
    // Given
    const trueSteps = [48, 50, 63];
    const patternsDisplay = buildPatternsDisplay({
      kick: buildBooleanPattern(trueSteps),
    });
    const velocitiesDisplay = buildVelocitiesDisplay({
      kick: buildVelocityPattern({ 63: 99 }),
    });
    const { result } = renderHook(() =>
      useGridPaging({
        patternsDisplay,
        velocitiesDisplay,
        selectedTrack: "kick",
      }),
    );
    act(() => {
      result.current.setLength(64);
    });

    // When
    act(() => {
      result.current.goToRange(3); // steps 48-63
    });

    // Then
    expect(result.current.rangeStart).toBe(48);
    expect(result.current.activePattern).toEqual([
      true, false, true, false, false, false, false, false,
      false, false, false, false, false, false, false, true,
    ]);
    expect(result.current.activeVelocities[15]).toBe(99);
  });

  test("re-slices activePattern/activeVelocities to the newly selected track's own data", () => {
    // Given
    const patternsDisplay = buildPatternsDisplay({
      kick: buildBooleanPattern([0]),
      snare: buildBooleanPattern([1]),
    });
    const velocitiesDisplay = buildVelocitiesDisplay({
      kick: buildVelocityPattern({ 0: 10 }),
      snare: buildVelocityPattern({ 1: 20 }),
    });
    const { result, rerender } = renderHook(
      (props: { selectedTrack: TrackId }) =>
        useGridPaging({
          patternsDisplay,
          velocitiesDisplay,
          selectedTrack: props.selectedTrack,
        }),
      { initialProps: { selectedTrack: "kick" as TrackId } },
    );
    expect(result.current.activePattern[0]).toBe(true);
    expect(result.current.activePattern[1]).toBe(false);

    // When
    rerender({ selectedTrack: "snare" });

    // Then
    expect(result.current.activePattern[0]).toBe(false);
    expect(result.current.activePattern[1]).toBe(true);
    expect(result.current.activeVelocities[1]).toBe(20);
  });
});
