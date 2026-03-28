import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { activityReactionsService } from "@/services/activityReactionsService";
describe("activityReactionsService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getByActivityId returns array", async () => { expect(Array.isArray(await activityReactionsService.getByActivityId("a1"))).toBe(true); });
});
