import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { permissionsService } from "@/services/permissionsService";
describe("permissionsService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getAllRoles returns array", async () => { expect(Array.isArray(await permissionsService.getAllRoles())).toBe(true); });
  it("getAllPermissions returns array", async () => { expect(Array.isArray(await permissionsService.getAllPermissions())).toBe(true); });
});
