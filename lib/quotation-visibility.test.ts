import { describe, expect, it } from "vitest";
import { getQuotationAvailability } from "./quotation-visibility";

describe("public quotation visibility", () => {
  it("reports no quotations when the eligible count is zero", () => {
    expect(getQuotationAvailability(0, false)).toBe("none");
  });

  it("distinguishes existing quotations from insufficient public aggregates", () => {
    expect(getQuotationAvailability(1, false)).toBe("insufficient");
    expect(getQuotationAvailability(2, false)).toBe("insufficient");
  });

  it("allows public price displays only when a safe aggregate exists", () => {
    expect(getQuotationAvailability(3, true)).toBe("available");
  });
});
