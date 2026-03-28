import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { quizQuestionsService } from "@/services/quizQuestionsService";
describe("quizQuestionsService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getByModuleId returns array", async () => { expect(Array.isArray(await quizQuestionsService.getByModuleId("m1"))).toBe(true); });
});
