import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { climateSurveyService } from "@/services/climateSurveyService";

describe("climateSurveyService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getActiveSurveys returns array", async () => {
    const r = await climateSurveyService.getActiveSurveys();
    expect(Array.isArray(r)).toBe(true);
  });
});
