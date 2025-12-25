/**
 * Input Validation Tests
 */

import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  sanitizeText,
  sanitizeSearchQuery,
  stripHtml,
  escapeHtml,
  validateInput,
  loginFormSchema,
} from "@/lib/inputValidation";

describe("inputValidation", () => {
  describe("emailSchema", () => {
    it("should accept valid emails", () => {
      expect(emailSchema.safeParse("test@example.com").success).toBe(true);
      expect(emailSchema.safeParse("user.name@domain.co.uk").success).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(emailSchema.safeParse("invalid").success).toBe(false);
      expect(emailSchema.safeParse("no@").success).toBe(false);
      expect(emailSchema.safeParse("@nodomain.com").success).toBe(false);
    });

    it("should trim whitespace", () => {
      const result = emailSchema.parse("  test@example.com  ");
      expect(result).toBe("test@example.com");
    });
  });

  describe("passwordSchema", () => {
    it("should accept valid passwords", () => {
      expect(passwordSchema.safeParse("Password1").success).toBe(true);
      expect(passwordSchema.safeParse("MySecure123").success).toBe(true);
    });

    it("should reject weak passwords", () => {
      expect(passwordSchema.safeParse("short").success).toBe(false);
      expect(passwordSchema.safeParse("nouppercase1").success).toBe(false);
      expect(passwordSchema.safeParse("NOLOWERCASE1").success).toBe(false);
      expect(passwordSchema.safeParse("NoNumbers").success).toBe(false);
    });
  });

  describe("nameSchema", () => {
    it("should accept valid names", () => {
      expect(nameSchema.safeParse("John Doe").success).toBe(true);
      expect(nameSchema.safeParse("José María").success).toBe(true);
      expect(nameSchema.safeParse("O'Brien").success).toBe(true);
    });

    it("should reject names with invalid characters", () => {
      expect(nameSchema.safeParse("Name123").success).toBe(false);
      expect(nameSchema.safeParse("Name@Special").success).toBe(false);
    });
  });

  describe("sanitizeText", () => {
    it("should strip HTML tags", () => {
      expect(sanitizeText("<p>Hello</p>")).toBe("Hello");
      expect(sanitizeText("<script>alert('xss')</script>")).toBe("alert('xss')");
    });

    it("should trim whitespace", () => {
      expect(sanitizeText("  Hello World  ")).toBe("Hello World");
    });
  });

  describe("stripHtml", () => {
    it("should remove all HTML tags", () => {
      expect(stripHtml("<div><p>Text</p></div>")).toBe("Text");
      expect(stripHtml("<a href='#'>Link</a>")).toBe("Link");
    });
  });

  describe("escapeHtml", () => {
    it("should escape special characters", () => {
      expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
      expect(escapeHtml("a & b")).toBe("a &amp; b");
      expect(escapeHtml('"quoted"')).toBe("&quot;quoted&quot;");
    });
  });

  describe("sanitizeSearchQuery", () => {
    it("should normalize and limit search queries", () => {
      expect(sanitizeSearchQuery("  hello   world  ")).toBe("hello world");
      expect(sanitizeSearchQuery("<script>test</script>")).toBe("test");
    });

    it("should limit length", () => {
      const longQuery = "a".repeat(300);
      expect(sanitizeSearchQuery(longQuery).length).toBe(200);
    });
  });

  describe("validateInput", () => {
    it("should return success for valid data", () => {
      const result = validateInput(loginFormSchema, {
        email: "test@example.com",
        password: "password123",
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("test@example.com");
      }
    });

    it("should return errors for invalid data", () => {
      const result = validateInput(loginFormSchema, {
        email: "invalid",
        password: "",
      });
      
      expect(result.success).toBe(false);
    });
  });
});
