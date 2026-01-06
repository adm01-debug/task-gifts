/**
 * Componente de Input de Busca
 * 
 * @module components/SearchInput
 */

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  debounceMs?: number;
  className?: string;
  showClear?: boolean;
  autoFocus?: boolean;
}

export function SearchInput({
  value: externalValue,
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  isLoading = false,
  debounceMs = 300,
  className,
  showClear = true,
  autoFocus = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(externalValue ?? '');
  
  // Handler unificado
  const handleChange = onChange ?? onSearch;

  // Sincronizar valor externo
  useEffect(() => {
    if (externalValue !== undefined) {
      setInternalValue(externalValue);
    }
  }, [externalValue]);

  // Debounce
  useEffect(() => {
    if (!handleChange) return;
    
    const timer = setTimeout(() => {
      if (internalValue !== externalValue) {
        handleChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, handleChange, externalValue]);

  const handleClear = () => {
    setInternalValue('');
    handleChange?.('');
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
        autoFocus={autoFocus}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {showClear && internalValue && !isLoading && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Limpar busca</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default SearchInput;
