import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { rbacService } from "@/services/rbacService";
describe("rbacService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getRoles returns array", async () => { expect(Array.isArray(await rbacService.getRoles())).toBe(true); });
  it("getPermissions returns array", async () => { expect(Array.isArray(await rbacService.getPermissions())).toBe(true); });
});
