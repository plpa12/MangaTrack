import { describe, expect, it } from "vitest";
import { getQuotationAvailability } from "./quotation-visibility";

describe("public quotation visibility", () => {
  it("reports no quotations when the eligible count is zero", () => {
    expect(getQuotationAvailability(0, false)).toBe("none");
  });

  it("distinguishes existing quotations from missing aggregate data", () => {
    expect(getQuotationAvailability(1, false)).toBe("insufficient");
    expect(getQuotationAvailability(2, false)).toBe("insufficient");
  });
  it("allows a single eligible quotation to produce a public aggregate", () => {
    expect(getQuotationAvailability(1, true)).toBe("available");
    expect(getQuotationAvailability(2, true)).toBe("available");
  });
});
