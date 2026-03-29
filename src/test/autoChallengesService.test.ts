import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { autoChallengesService } from "@/services/autoChallengesService";
describe("autoChallengesService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("exists and exports service object", () => {
    expect(autoChallengesService).toBeDefined();
    expect(typeof autoChallengesService).toBe("object");
  });
});
