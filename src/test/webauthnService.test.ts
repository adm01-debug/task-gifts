import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { webauthnService } from "@/services/webauthnService";
describe("webauthnService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("exists and exports service object", () => {
    expect(webauthnService).toBeDefined();
    expect(typeof webauthnService).toBe("object");
  });
});
