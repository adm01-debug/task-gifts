import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { quizStatsService } from "@/services/quizStatsService";
describe("quizStatsService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("exists and exports service object", () => {
    expect(quizStatsService).toBeDefined();
    expect(typeof quizStatsService).toBe("object");
  });
});
