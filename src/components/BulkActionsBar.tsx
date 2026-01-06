/**
 * Componente de Barra de Ações em Massa
 * 
 * @module components/BulkActionsBar
 */

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { X, Loader2 } from 'lucide-react';
import { BulkAction } from '@/hooks/useBulkActions';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

// Simple action interface for toolbar usage
export interface SimpleBulkAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

interface BulkActionsBarProps<T> {
  selectionCount?: number;
  selectedCount?: number;
  actions?: BulkAction<T>[] | SimpleBulkAction[];
  onAction?: (actionId: string) => Promise<void>;
  onClear?: () => void;
  onClearSelection?: () => void;
  isExecuting?: boolean;
  className?: string;
}

function isSimpleAction(action: BulkAction<unknown> | SimpleBulkAction): action is SimpleBulkAction {
  return 'key' in action && 'onClick' in action;
}

export function BulkActionsBar<T>({
  selectionCount,
  selectedCount,
  actions = [],
  onAction,
  onClear,
  onClearSelection,
  isExecuting = false,
  className,
}: BulkActionsBarProps<T>) {
  const count = selectionCount ?? selectedCount ?? 0;
  const handleClear = onClear ?? onClearSelection;

  if (count === 0) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border bg-background p-2 shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-2 px-2">
        <span className="text-sm font-medium">
          {count} selecionado{count > 1 ? 's' : ''}
        </span>
        {handleClear && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleClear}
            disabled={isExecuting}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Limpar seleção</span>
          </Button>
        )}
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-1">
        {actions.map((action) => {
          if (isSimpleAction(action)) {
            // Simple action (from toolbar)
            return (
              <Button
                key={action.key}
                variant="outline"
                size="sm"
                disabled={isExecuting}
                onClick={action.onClick}
                className="gap-2"
              >
                {action.icon}
                {action.label}
              </Button>
            );
          }

          // Full BulkAction type
          const ActionButton = (
            <Button
              key={action.id}
              variant={action.variant ?? 'outline'}
              size="sm"
              disabled={isExecuting}
              onClick={action.confirm ? undefined : () => onAction?.(action.id)}
              className="gap-2"
            >
              {isExecuting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                action.icon && <action.icon className="h-4 w-4" />
              )}
              {action.label}
            </Button>
          );

          if (action.confirm) {
            return (
              <AlertDialog key={action.id}>
                <AlertDialogTrigger asChild>{ActionButton}</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{action.confirm.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {action.confirm.description}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onAction?.(action.id)}
                      className={
                        action.variant === 'destructive'
                          ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                          : ''
                      }
                    >
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            );
          }

          return ActionButton;
        })}
      </div>
    </div>
  );
}

export default BulkActionsBar;
