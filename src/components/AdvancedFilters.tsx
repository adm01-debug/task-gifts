/**
 * Componente de Filtros Avançados
 * 
 * @module components/AdvancedFilters
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Filter, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TIPOS
// ============================================

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterValue {
  key: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike';
  value: unknown;
}

interface AdvancedFiltersProps {
  filters: FilterConfig[];
  values: FilterValue[];
  onChange: (values: FilterValue[]) => void;
  className?: string;
}

// ============================================
// COMPONENTE
// ============================================

export function AdvancedFilters({
  filters,
  values,
  onChange,
  className,
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);

  const addFilter = (key: string) => {
    const config = filters.find(f => f.key === key);
    if (!config) return;

    const newFilter: FilterValue = {
      key,
      operator: 'eq',
      value: '',
    };

    onChange([...values, newFilter]);
  };

  const updateFilter = (index: number, updates: Partial<FilterValue>) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], ...updates };
    onChange(newValues);
  };

  const removeFilter = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    onChange([]);
  };

  const availableFilters = filters.filter(
    f => !values.some(v => v.key === f.key)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-2', className)}
        >
          <Filter className="h-4 w-4" />
          Filtros
          {values.length > 0 && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {values.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtros Avançados</h4>
            {values.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-8 px-2 text-xs"
              >
                Limpar todos
              </Button>
            )}
          </div>

          {/* Active Filters */}
          <div className="space-y-2">
            {values.map((filter, index) => {
              const config = filters.find(f => f.key === filter.key);
              if (!config) return null;

              return (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-md border p-2"
                >
                  <Label className="min-w-[80px] text-xs">
                    {config.label}
                  </Label>

                  {config.type === 'select' ? (
                    <Select
                      value={filter.value as string}
                      onValueChange={(value) =>
                        updateFilter(index, { value })
                      }
                    >
                      <SelectTrigger className="h-8 flex-1">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {config.options?.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={config.type === 'number' ? 'number' : config.type === 'date' ? 'date' : 'text'}
                      value={filter.value as string}
                      onChange={(e) =>
                        updateFilter(index, { value: e.target.value })
                      }
                      className="h-8 flex-1"
                      placeholder={config.placeholder}
                    />
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeFilter(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Add Filter */}
          {availableFilters.length > 0 && (
            <Select onValueChange={addFilter}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Adicionar filtro</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {availableFilters.map((filter) => (
                  <SelectItem key={filter.key} value={filter.key}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default AdvancedFilters;
