import { act, renderHook } from "@testing-library/react";
import { useTrackPatterns } from "./useTrackPatterns";
import { MAX_STEPS } from "../sequencerConstants";

describe("useTrackPatterns", () => {
  test("starts with every track's pattern all-false and selectedTrack on the first track", () => {
    // Given / When
    const { result } = renderHook(() => useTrackPatterns());

    // Then
    expect(result.current.selectedTrack).toBe("kick");
    expect(result.current.patternsDisplay.kick).toEqual(
      Array(MAX_STEPS).fill(false),
    );
    expect(result.current.patternsDisplay.snare).toEqual(
      Array(MAX_STEPS).fill(false),
    );
  });

  test("setStep activates the given index on the selected track only", () => {
    // Given
    const { result } = renderHook(() => useTrackPatterns());

    // When
    act(() => {
      result.current.setStep(5, true);
    });

    // Then
    expect(result.current.patternsDisplay.kick[5]).toBe(true);
    // Other indices on the same track are untouched.
    expect(result.current.patternsDisplay.kick[4]).toBe(false);
    expect(result.current.patternsDisplay.kick[6]).toBe(false);
    // Other tracks are untouched.
    expect(result.current.patternsDisplay.snare).toEqual(
      Array(MAX_STEPS).fill(false),
    );
  });

  test("setStep writes to whichever track is selected, not always the first one", () => {
    // Given
    const { result } = renderHook(() => useTrackPatterns());
    act(() => {
      result.current.selectTrack("snare");
    });

    // When
    act(() => {
      result.current.setStep(3, true);
    });

    // Then
    expect(result.current.patternsDisplay.snare[3]).toBe(true);
    // The track that was selected before is untouched.
    expect(result.current.patternsDisplay.kick).toEqual(
      Array(MAX_STEPS).fill(false),
    );
  });

  test("setVelocity sets the velocity at the given index on the selected track only", () => {
    // Given
    const { result } = renderHook(() => useTrackPatterns());
    const defaultVelocity = result.current.velocitiesDisplay.kick[0];

    // When
    act(() => {
      result.current.setVelocity(10, 127);
    });

    // Then
    expect(result.current.velocitiesDisplay.kick[10]).toBe(127);
    // Other indices on the same track keep their default velocity.
    expect(result.current.velocitiesDisplay.kick[9]).toBe(defaultVelocity);
    // Other tracks are untouched.
    expect(result.current.velocitiesDisplay.snare).toEqual(
      Array(MAX_STEPS).fill(defaultVelocity),
    );
  });

  test("setStep works correctly at the first boundary index (0)", () => {
    // Given
    const { result } = renderHook(() => useTrackPatterns());

    // When
    act(() => {
      result.current.setStep(0, true);
    });

    // Then
    expect(result.current.patternsDisplay.kick[0]).toBe(true);
  });

  test("setStep works correctly at the last boundary index (MAX_STEPS - 1)", () => {
    // Given
    const { result } = renderHook(() => useTrackPatterns());
    const lastIndex = MAX_STEPS - 1;

    // When
    act(() => {
      result.current.setStep(lastIndex, true);
    });

    // Then
    expect(result.current.patternsDisplay.kick[lastIndex]).toBe(true);
    // No out-of-bounds spillover onto a neighboring index.
    expect(result.current.patternsDisplay.kick[lastIndex - 1]).toBe(false);
  });

  test("clearTrack resets only the selected track's pattern and velocities, leaving other tracks untouched", () => {
    // Given
    const { result } = renderHook(() => useTrackPatterns());
    const defaultVelocity = result.current.velocitiesDisplay.kick[0];
    act(() => {
      result.current.setStep(2, true);
      result.current.setVelocity(2, 50);
    });
    act(() => {
      result.current.selectTrack("snare");
    });
    act(() => {
      result.current.setStep(4, true);
      result.current.setVelocity(4, 60);
    });
    // Sanity check before clearing: both tracks carry edits.
    expect(result.current.patternsDisplay.kick[2]).toBe(true);
    expect(result.current.patternsDisplay.snare[4]).toBe(true);

    // When
    act(() => {
      result.current.clearTrack(); // clears "snare", the currently selected track
    });

    // Then
    expect(result.current.patternsDisplay.snare).toEqual(
      Array(MAX_STEPS).fill(false),
    );
    expect(result.current.velocitiesDisplay.snare).toEqual(
      Array(MAX_STEPS).fill(defaultVelocity),
    );
    // The other track's earlier edits survive the clear.
    expect(result.current.patternsDisplay.kick[2]).toBe(true);
    expect(result.current.velocitiesDisplay.kick[2]).toBe(50);
  });
});
