import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { enpsService } from "@/services/enpsService";

describe("enpsService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getActiveSurvey returns null when none active", async () => {
    const r = await enpsService.getActiveSurvey();
    expect(r).toBeNull();
  });
});
