import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { quizService } from "@/services/quizService";
describe("quizService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("exists and exports service object", () => {
    expect(quizService).toBeDefined();
    expect(typeof quizService).toBe("object");
  });
});
