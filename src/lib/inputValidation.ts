/**
 * Input Validation Utilities
 * Centralized validation schemas and sanitization functions
 */

import { z } from "zod";

// ============= Common Schemas =============

export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Email inválido" })
  .max(255, { message: "Email muito longo" });

export const passwordSchema = z
  .string()
  .min(8, { message: "Mínimo 8 caracteres" })
  .max(128, { message: "Máximo 128 caracteres" })
  .regex(/[A-Z]/, { message: "Deve conter letra maiúscula" })
  .regex(/[a-z]/, { message: "Deve conter letra minúscula" })
  .regex(/[0-9]/, { message: "Deve conter número" });

export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "Mínimo 2 caracteres" })
  .max(100, { message: "Máximo 100 caracteres" })
  .regex(/^[\p{L}\p{M}\s'-]+$/u, { message: "Nome contém caracteres inválidos" });

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s()-]{10,20}$/, { message: "Telefone inválido" })
  .optional();

export const urlSchema = z
  .string()
  .trim()
  .url({ message: "URL inválida" })
  .max(2048, { message: "URL muito longa" })
  .optional();

export const textAreaSchema = (maxLength: number = 1000) =>
  z
    .string()
    .trim()
    .max(maxLength, { message: `Máximo ${maxLength} caracteres` });

export const uuidSchema = z
  .string()
  .uuid({ message: "ID inválido" });

export const dateSchema = z
  .string()
  .datetime({ message: "Data inválida" });

export const positiveIntSchema = z
  .number()
  .int()
  .positive({ message: "Deve ser um número positivo" });

export const ratingSchema = z
  .number()
  .min(1, { message: "Mínimo 1" })
  .max(5, { message: "Máximo 5" });

// ============= Sanitization Functions =============

/**
 * Remove HTML tags from string
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return input.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Sanitize string for safe display
 */
export function sanitizeText(input: string): string {
  return stripHtml(input).trim();
}

/**
 * Sanitize URL parameters
 */
export function sanitizeUrlParam(input: string): string {
  return encodeURIComponent(input.trim());
}

/**
 * Normalize whitespace
 */
export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * Remove control characters
 */
export function removeControlChars(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Sanitize for search queries
 */
export function sanitizeSearchQuery(input: string): string {
  return normalizeWhitespace(removeControlChars(stripHtml(input)))
    .slice(0, 200);
}

// ============= Form Schemas =============

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Senha é obrigatória" }),
});

export const signupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const profileFormSchema = z.object({
  full_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  bio: textAreaSchema(500).optional(),
  avatar_url: urlSchema,
});

export const goalFormSchema = z.object({
  title: z.string().trim().min(3, "Mínimo 3 caracteres").max(200, "Máximo 200 caracteres"),
  description: textAreaSchema(1000).optional(),
  due_date: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
});

export const feedbackFormSchema = z.object({
  overall_rating: ratingSchema,
  strengths: textAreaSchema(500).optional(),
  improvements: textAreaSchema(500).optional(),
});

export const kudosFormSchema = z.object({
  recipient_id: uuidSchema,
  message: textAreaSchema(500),
  category: z.string().min(1, "Categoria é obrigatória"),
});

// ============= Validation Helpers =============

/**
 * Validate and parse with schema
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(e => e.message);
  return { success: false, errors };
}

/**
 * Get validation error messages
 */
export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  
  for (const issue of error.errors) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  
  return errors;
}

// Types
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type SignupFormData = z.infer<typeof signupFormSchema>;
export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type GoalFormData = z.infer<typeof goalFormSchema>;
export type FeedbackFormData = z.infer<typeof feedbackFormSchema>;
export type KudosFormData = z.infer<typeof kudosFormSchema>;
