import { describe, expect, it } from "vitest";
import { parseDateTimeLocal } from "./datetime";

describe("parseDateTimeLocal", () => {
  it("converts a Brazil UTC-3 local time to UTC", () => {
    expect(parseDateTimeLocal("2026-10-28T10:30", 180)).toBe("2026-10-28T13:30:00.000Z");
  });

  it("converts a UTC+9 local time to UTC", () => {
    expect(parseDateTimeLocal("2026-10-28T10:30", -540)).toBe("2026-10-28T01:30:00.000Z");
  });

  it("rejects invalid dates and offsets", () => {
    expect(parseDateTimeLocal("2026-02-30T10:30", 180)).toBeNull();
    expect(parseDateTimeLocal("2026-10-28T10:30", 900)).toBeNull();
    expect(parseDateTimeLocal("", 180)).toBeNull();
  });
});
