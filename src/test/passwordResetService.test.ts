import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { passwordResetService } from "@/services/passwordResetService";
describe("passwordResetService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("exists and exports service object", () => {
    expect(passwordResetService).toBeDefined();
    expect(typeof passwordResetService).toBe("object");
  });
});
