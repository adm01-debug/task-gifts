import { z } from "zod";

// Password strength validation
export const passwordSchema = z
  .string()
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "Senha deve conter pelo menos um número")
  .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial");

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email é obrigatório")
  .email("Email inválido")
  .max(255, "Email muito longo");

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(50, "Nome deve ter no máximo 50 caracteres")
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras")
  .optional();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

// Password strength checker
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 2) return { score, label: "Fraca", color: "bg-destructive" };
  if (score <= 4) return { score, label: "Média", color: "bg-yellow-500" };
  return { score, label: "Forte", color: "bg-green-500" };
}
