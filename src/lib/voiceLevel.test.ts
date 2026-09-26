import { computeLevel } from "./voiceLevel";

describe("computeLevel", () => {
  test("returns 0 when muted, regardless of volume or velocity", () => {
    // Given
    const muted = true;
    const volume = 100;
    const velocity = 100;

    // When
    const level = computeLevel(muted, volume, velocity);

    // Then
    expect(level).toBe(0);
  });

  test("returns 0 when muted even at minimum volume and velocity", () => {
    // Given
    const muted = true;
    const volume = 0;
    const velocity = 0;

    // When
    const level = computeLevel(muted, volume, velocity);

    // Then
    expect(level).toBe(0);
  });

  test("scales to full level at max volume and max velocity when unmuted", () => {
    // Given
    const muted = false;
    const volume = 100;
    const velocity = 100;

    // When
    const level = computeLevel(muted, volume, velocity);

    // Then
    expect(level).toBe(1);
  });

  test("returns 0 when unmuted but volume is at its minimum", () => {
    // Given
    const muted = false;
    const volume = 0;
    const velocity = 100;

    // When
    const level = computeLevel(muted, volume, velocity);

    // Then
    expect(level).toBe(0);
  });

  test("returns 0 when unmuted but velocity is at its minimum", () => {
    // Given
    const muted = false;
    const volume = 100;
    const velocity = 0;

    // When
    const level = computeLevel(muted, volume, velocity);

    // Then
    expect(level).toBe(0);
  });

  test("multiplies volume and velocity fractions together at a representative midpoint", () => {
    // Given
    const muted = false;
    const volume = 75;
    const velocity = 50;

    // When
    const level = computeLevel(muted, volume, velocity);

    // Then
    expect(level).toBeCloseTo(0.375);
  });

  test("defaults velocity to 100 (full) when no velocity argument is passed", () => {
    // Given
    const muted = false;
    const volume = 80;

    // When
    const level = computeLevel(muted, volume);

    // Then
    expect(level).toBeCloseTo(0.8);
  });
});
