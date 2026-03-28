import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { activityCommentsService } from "@/services/activityCommentsService";
describe("activityCommentsService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getByActivityId returns array", async () => { expect(Array.isArray(await activityCommentsService.getByActivityId("a1"))).toBe(true); });
});
