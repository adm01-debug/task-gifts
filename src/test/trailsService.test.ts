import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
vi.mock("@/services/missionsService", () => ({ missionsService: { incrementByMetricKey: vi.fn() } }));
vi.mock("@/services/comboService", () => ({ comboService: { registerAction: vi.fn().mockResolvedValue({ finalXp: 25, bonusXp: 0, multiplier: 1 }) } }));
vi.mock("@/services/certificationsService", () => ({ certificationsService: { generateCertificate: vi.fn() } }));
import { trailsService } from "@/services/trailsService";

describe("trailsService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getAll returns array", async () => {
    const r = await trailsService.getAll();
    expect(Array.isArray(r)).toBe(true);
  });
  it("getById returns null when not found", async () => {
    const r = await trailsService.getById("nonexistent");
    expect(r).toBeNull();
  });
});
