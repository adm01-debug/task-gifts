import { motion } from "framer-motion";
import { getPasswordStrength } from "@/lib/authValidations";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ 
  password, 
  className 
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;
  
  const { score, label, color } = getPasswordStrength(password);
  const maxScore = 6;
  const percentage = (score / maxScore) * 100;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Força da senha</span>
        <span className={cn(
          "text-xs font-medium",
          score <= 2 ? "text-destructive" : score <= 4 ? "text-yellow-600" : "text-green-600"
        )}>
          {label}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <ul className="text-xs text-muted-foreground space-y-0.5 mt-2">
        <li className={cn(password.length >= 8 && "text-green-600")}>
          {password.length >= 8 ? "✓" : "○"} Mínimo 8 caracteres
        </li>
        <li className={cn(/[A-Z]/.test(password) && "text-green-600")}>
          {/[A-Z]/.test(password) ? "✓" : "○"} Uma letra maiúscula
        </li>
        <li className={cn(/[a-z]/.test(password) && "text-green-600")}>
          {/[a-z]/.test(password) ? "✓" : "○"} Uma letra minúscula
        </li>
        <li className={cn(/[0-9]/.test(password) && "text-green-600")}>
          {/[0-9]/.test(password) ? "✓" : "○"} Um número
        </li>
        <li className={cn(/[^A-Za-z0-9]/.test(password) && "text-green-600")}>
          {/[^A-Za-z0-9]/.test(password) ? "✓" : "○"} Um caractere especial
        </li>
      </ul>
    </div>
  );
}
