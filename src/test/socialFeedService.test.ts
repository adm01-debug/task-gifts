import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { socialFeedService } from "@/services/socialFeedService";
describe("socialFeedService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("exists and exports service object", () => {
    expect(socialFeedService).toBeDefined();
    expect(typeof socialFeedService).toBe("object");
  });
});
