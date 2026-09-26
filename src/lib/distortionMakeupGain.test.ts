import { distortionMakeupGain } from "./distortionMakeupGain";

describe("distortionMakeupGain", () => {
  test("returns exactly 3 at zero distortion amount", () => {
    // Given
    const amount = 0;

    // When
    const gain = distortionMakeupGain(amount);

    // Then
    // At amount=0, k=0, so peakOutput = (3*20*(PI/180))/PI = 1/3 exactly.
    expect(gain).toBeCloseTo(3);
  });

  test("returns the correct makeup gain at a low distortion amount", () => {
    // Given
    const amount = 0.04; // the fixed amount the tom voices use

    // When
    const gain = distortionMakeupGain(amount);

    // Then
    expect(gain).toBeCloseTo(2.9227365575166377);
  });

  test("returns the correct makeup gain at a mid-range distortion amount", () => {
    // Given
    const amount = 0.5;

    // When
    const gain = distortionMakeupGain(amount);

    // Then
    expect(gain).toBeCloseTo(2.872442429862374);
  });

  test("returns the correct makeup gain at maximum (1) distortion amount", () => {
    // Given
    const amount = 1;

    // When
    const gain = distortionMakeupGain(amount);

    // Then
    expect(gain).toBeCloseTo(2.868727160829239);
  });

  test("decreases monotonically as distortion amount increases from 0 to 1", () => {
    // Given
    const amounts = [0, 0.04, 0.5, 1];

    // When
    const gains = amounts.map(distortionMakeupGain);

    // Then
    for (let i = 1; i < gains.length; i++) {
      expect(gains[i]).toBeLessThan(gains[i - 1]);
    }
  });
});
