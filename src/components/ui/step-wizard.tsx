import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  content: ReactNode;
  isOptional?: boolean;
  canSkip?: boolean;
}

interface StepWizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  onSkip?: () => void;
  allowClose?: boolean;
  onClose?: () => void;
  title?: string;
}

export function StepWizard({
  steps,
  onComplete,
  onSkip,
  allowClose = true,
  onClose,
  title = "Bem-vindo!",
}: StepWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkipStep = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            {allowClose && onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Passo {currentStep + 1} de {steps.length}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {steps.map((step, index) => (
              <motion.button
                key={step.id}
                onClick={() => index <= Math.max(...completedSteps, currentStep) && setCurrentStep(index)}
                className={`
                  relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all
                  ${index === currentStep
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : completedSteps.has(index)
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                  }
                `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {completedSteps.has(index) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-6">
                {steps[currentStep].icon && (
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {steps[currentStep].icon}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {steps[currentStep].title}
                  </h3>
                  {steps[currentStep].description && (
                    <p className="text-sm text-muted-foreground">
                      {steps[currentStep].description}
                    </p>
                  )}
                </div>
              </div>

              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button variant="ghost" onClick={handlePrev}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            )}
            
            {steps[currentStep].canSkip && !isLastStep && (
              <Button variant="ghost" onClick={handleSkipStep}>
                Pular
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onSkip && (
              <Button variant="outline" onClick={onSkip}>
                Pular Tutorial
              </Button>
            )}
            
            <Button onClick={handleNext}>
              {isLastStep ? (
                <>
                  Concluir
                  <Check className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Componentes auxiliares para conteúdo do wizard
export function WizardContent({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

export function WizardHighlight({ 
  children, 
  variant = "info" 
}: { 
  children: ReactNode;
  variant?: "info" | "success" | "warning";
}) {
  const variants = {
    info: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
    success: "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300",
  };

  return (
    <div className={`p-4 rounded-lg border ${variants[variant]}`}>
      {children}
    </div>
  );
}
