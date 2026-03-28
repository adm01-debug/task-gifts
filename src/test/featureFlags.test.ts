import { describe, it, expect } from "vitest";
import { isFeatureEnabled, getAllFlags } from "@/lib/featureFlags";

describe("featureFlags", () => {
  it("returns false for unknown flags", () => {
    expect(isFeatureEnabled("NONEXISTENT_FLAG")).toBe(false);
  });

  it("getAllFlags returns object", () => {
    const flags = getAllFlags();
    expect(typeof flags).toBe("object");
  });
});
