import { memo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, Award, Users, Zap, ArrowRight, ArrowLeft, 
  CheckCircle2, Sparkles, Rocket, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  completed?: boolean;
}

interface ProgressiveOnboardingProps {
  onComplete?: () => void;
  onSkip?: () => void;
  className?: string;
}

const defaultSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao ElevateHR! 🚀",
    description: "Sua jornada de crescimento começa aqui. Vamos conhecer a plataforma juntos?",
    icon: <Rocket className="h-8 w-8" />,
  },
  {
    id: "profile",
    title: "Complete seu Perfil",
    description: "Adicione sua foto e informações para personalizar sua experiência.",
    icon: <Users className="h-8 w-8" />,
  },
  {
    id: "first-mission",
    title: "Sua Primeira Missão",
    description: "Conclua uma tarefa simples e ganhe seus primeiros XP e moedas!",
    icon: <Target className="h-8 w-8" />,
  },
  {
    id: "explore",
    title: "Explore os Módulos",
    description: "Descubra PDI, Feedback 360°, Clima e muito mais.",
    icon: <Sparkles className="h-8 w-8" />,
  },
  {
    id: "achievements",
    title: "Conquiste Badges",
    description: "Complete desafios para desbloquear recompensas exclusivas!",
    icon: <Award className="h-8 w-8" />,
  },
];

export const ProgressiveOnboarding = memo(function ProgressiveOnboarding({
  onComplete,
  onSkip,
  className,
}: ProgressiveOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(defaultSteps);
  const [isVisible, setIsVisible] = useState(true);
  const [direction, setDirection] = useState(0);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      setSteps((prev) =>
        prev.map((step, i) => (i === currentStep ? { ...step, completed: true } : step))
      );
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 500);
    } else {
      setDirection(1);
      setSteps((prev) =>
        prev.map((step, i) => (i === currentStep ? { ...step, completed: true } : step))
      );
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, isLastStep, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    onSkip?.();
  }, [onSkip]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <Card className="relative w-full max-w-lg mx-4 p-6 overflow-hidden">
        {/* Skip Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSkip}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Passo {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((s, index) => (
            <button
              key={s.id}
              onClick={() => {
                setDirection(index > currentStep ? 1 : -1);
                setCurrentStep(index);
              }}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                index === currentStep
                  ? "bg-primary w-8"
                  : s.completed
                  ? "bg-primary/60"
                  : "bg-muted hover:bg-muted-foreground/30"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6"
            >
              {step.icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold mb-3"
            >
              {step.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground mb-8"
            >
              {step.description}
            </motion.p>

            {/* Action Button (if step has one) */}
            {step.action && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-4"
              >
                <Button
                  variant="outline"
                  onClick={step.action.onClick}
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  {step.action.label}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          <Button onClick={handleNext} className="gap-2">
            {isLastStep ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Começar!
              </>
            ) : (
              <>
                Próximo
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Celebration particles on completion */}
        <AnimatePresence>
          {step.completed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    scale: 0,
                    x: "50%",
                    y: "50%",
                  }}
                  animate={{
                    opacity: 0,
                    scale: 1,
                    x: `${50 + Math.cos((i * 30 * Math.PI) / 180) * 100}%`,
                    y: `${50 + Math.sin((i * 30 * Math.PI) / 180) * 100}%`,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1"][i % 4],
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
});

// Compact version for inline use
interface OnboardingChecklist {
  steps: OnboardingStep[];
  onStepComplete?: (stepId: string) => void;
  className?: string;
}

export const OnboardingChecklist = memo(function OnboardingChecklist({
  steps,
  onStepComplete,
  className,
}: OnboardingChecklist) {
  const completedCount = steps.filter((s) => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Primeiros Passos</h3>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{steps.length}
        </span>
      </div>

      <Progress value={progress} className="h-2 mb-4" />

      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg transition-colors",
              step.completed ? "bg-primary/5" : "hover:bg-muted"
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                step.completed
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.completed ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  step.completed && "line-through text-muted-foreground"
                )}
              >
                {step.title}
              </p>
            </div>

            {!step.completed && step.action && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  step.action?.onClick();
                  onStepComplete?.(step.id);
                }}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </Card>
  );
});

export default ProgressiveOnboarding;
