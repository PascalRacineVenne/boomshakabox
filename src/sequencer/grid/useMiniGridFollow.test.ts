import { act, renderHook } from "@testing-library/react";
import { useMiniGridFollow } from "./useMiniGridFollow";
import { MINI_GRID_RANGE_SIZE } from "../sequencerConstants";

describe("useMiniGridFollow", () => {
  test("starts at miniRange 0 when currentStep is 0", () => {
    // Given
    const currentStep = 0;

    // When
    const { result } = renderHook(() => useMiniGridFollow(currentStep));

    // Then
    expect(result.current.miniRange).toBe(0);
  });

  test("auto-follows miniRange to Math.floor(currentStep / MINI_GRID_RANGE_SIZE) as the step advances", () => {
    // Given
    const { result, rerender } = renderHook(
      (step: number) => useMiniGridFollow(step),
      { initialProps: 0 },
    );
    expect(result.current.miniRange).toBe(0);

    // When
    const nextStep = MINI_GRID_RANGE_SIZE + 8; // lands in the second mini-range
    rerender(nextStep);

    // Then
    expect(result.current.miniRange).toBe(
      Math.floor(nextStep / MINI_GRID_RANGE_SIZE),
    );
  });

  test("goToMiniRange resumes auto-follow when the chosen range equals the current live range", () => {
    // Given
    const currentStep = MINI_GRID_RANGE_SIZE + 8; // live range = 1
    const liveRange = Math.floor(currentStep / MINI_GRID_RANGE_SIZE);
    const { result, rerender } = renderHook(
      (step: number) => useMiniGridFollow(step),
      { initialProps: currentStep },
    );

    // When
    act(() => {
      result.current.goToMiniRange(liveRange);
    });

    // Then
    expect(result.current.miniRange).toBe(liveRange);
    // Auto-follow should be back on: advancing the step moves miniRange again.
    const laterStep = MINI_GRID_RANGE_SIZE * 2 + 3; // live range = 2
    rerender(laterStep);
    expect(result.current.miniRange).toBe(2);
  });

  test("goToMiniRange stays manually overridden when the chosen range differs from the current live range", () => {
    // Given
    const currentStep = MINI_GRID_RANGE_SIZE + 8; // live range = 1
    const manualRange = 0;
    const { result, rerender } = renderHook(
      (step: number) => useMiniGridFollow(step),
      { initialProps: currentStep },
    );

    // When
    act(() => {
      result.current.goToMiniRange(manualRange);
    });

    // Then
    expect(result.current.miniRange).toBe(manualRange);
    // Auto-follow should stay off: advancing the step does NOT move miniRange.
    const laterStep = MINI_GRID_RANGE_SIZE * 2 + 3; // live range = 2
    rerender(laterStep);
    expect(result.current.miniRange).toBe(manualRange);
  });

  test("reset returns miniRange to 0 and re-enables auto-follow", () => {
    // Given: currentStep stays at 0 here, so liveRange is 0 throughout —
    // reset()'s own effect is what's under test (manualRange -> 0,
    // autoFollow -> true), not a coincidental currentStep=0 read.
    const { result, rerender } = renderHook(
      (step: number) => useMiniGridFollow(step),
      { initialProps: 0 },
    );
    act(() => {
      result.current.goToMiniRange(5); // manual override, away from live range
    });
    expect(result.current.miniRange).toBe(5);

    // When
    act(() => {
      result.current.reset();
    });

    // Then
    expect(result.current.miniRange).toBe(0);
    // Auto-follow should be back on: advancing the step moves miniRange again.
    const laterStep = MINI_GRID_RANGE_SIZE * 2 + 3; // live range = 2
    rerender(laterStep);
    expect(result.current.miniRange).toBe(2);
  });
});
