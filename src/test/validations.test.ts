import { describe, it, expect } from "vitest";
import { emailSchema, strongPasswordSchema } from "@/lib/validations";

describe("validations", () => {
  describe("emailSchema", () => {
    it("accepts valid email", () => {
      expect(emailSchema.parse("Test@Example.com")).toBe("test@example.com");
    });

    it("trims whitespace", () => {
      expect(emailSchema.parse("  a@b.com  ")).toBe("a@b.com");
    });

    it("rejects empty string", () => {
      expect(() => emailSchema.parse("")).toThrow();
    });

    it("rejects invalid email", () => {
      expect(() => emailSchema.parse("not-an-email")).toThrow("Email inválido");
    });
  });

  describe("strongPasswordSchema", () => {
    it("accepts strong password", () => {
      expect(() => strongPasswordSchema.parse("Abc12345!")).not.toThrow();
    });

    it("rejects short password", () => {
      expect(() => strongPasswordSchema.parse("Ab1!")).toThrow("8 caracteres");
    });

    it("rejects without uppercase", () => {
      expect(() => strongPasswordSchema.parse("abc12345!")).toThrow("maiúscula");
    });

    it("rejects without lowercase", () => {
      expect(() => strongPasswordSchema.parse("ABC12345!")).toThrow("minúscula");
    });

    it("rejects without number", () => {
      expect(() => strongPasswordSchema.parse("Abcdefgh!")).toThrow("número");
    });

    it("rejects without special char", () => {
      expect(() => strongPasswordSchema.parse("Abc12345")).toThrow("especial");
    });
  });
});
