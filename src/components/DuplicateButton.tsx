import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DuplicateButtonProps {
  onDuplicate: () => Promise<void>;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  label?: string;
  className?: string;
}

export const DuplicateButton = memo(function DuplicateButton({
  onDuplicate,
  variant = 'outline',
  size = 'sm',
  label = 'Duplicar',
  className,
}: DuplicateButtonProps) {
  const [duplicating, setDuplicating] = useState(false);

  const handleDuplicate = async () => {
    try {
      setDuplicating(true);
      await onDuplicate();
      toast.success('Registro duplicado com sucesso!');
    } catch (error) {
      toast.error('Erro ao duplicar registro');
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDuplicate}
      disabled={duplicating}
      className={className}
    >
      {duplicating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {size !== 'icon' && <span className="ml-1">{label}</span>}
    </Button>
  );
});

export default DuplicateButton;
