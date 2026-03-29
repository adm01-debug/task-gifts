import { describe, it, expect } from "vitest";

// Inline the functions since Edge Function imports don't work in Vitest
function validateRequired(obj: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === "") return `Missing required field: ${field}`;
  }
  return null;
}
function validateEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validateUUID(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
function validateNumberRange(value: unknown, min: number, max: number): boolean {
  if (typeof value !== "number") return false;
  return value >= min && value <= max;
}

describe("Edge Function validation", () => {
  describe("validateRequired", () => {
    it("returns null when all fields present", () => {
      expect(validateRequired({ a: 1, b: "x" }, ["a", "b"])).toBeNull();
    });
    it("returns error for missing field", () => {
      expect(validateRequired({ a: 1 }, ["a", "b"])).toBe("Missing required field: b");
    });
    it("rejects null values", () => {
      expect(validateRequired({ a: null }, ["a"])).toBe("Missing required field: a");
    });
    it("rejects empty strings", () => {
      expect(validateRequired({ a: "" }, ["a"])).toBe("Missing required field: a");
    });
  });

  describe("validateEmail", () => {
    it("accepts valid email", () => { expect(validateEmail("a@b.com")).toBe(true); });
    it("rejects no @", () => { expect(validateEmail("abc")).toBe(false); });
    it("rejects non-string", () => { expect(validateEmail(123)).toBe(false); });
  });

  describe("validateUUID", () => {
    it("accepts valid UUID", () => { expect(validateUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true); });
    it("rejects invalid", () => { expect(validateUUID("not-a-uuid")).toBe(false); });
    it("rejects non-string", () => { expect(validateUUID(null)).toBe(false); });
  });

  describe("validateNumberRange", () => {
    it("accepts in range", () => { expect(validateNumberRange(5, 1, 10)).toBe(true); });
    it("rejects below", () => { expect(validateNumberRange(0, 1, 10)).toBe(false); });
    it("rejects above", () => { expect(validateNumberRange(11, 1, 10)).toBe(false); });
    it("rejects non-number", () => { expect(validateNumberRange("5", 1, 10)).toBe(false); });
  });
});
