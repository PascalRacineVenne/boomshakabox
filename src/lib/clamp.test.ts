import { clamp } from "./clamp";

describe("clamp", () => {
  test("returns the value unchanged when it is within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  test("clamps to the minimum when the value is below range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  test("clamps to the maximum when the value is above range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
