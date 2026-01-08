import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Filter, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
}

export interface FilterValue {
  key: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains';
  value: unknown;
}

interface AdvancedFiltersProps {
  filters: FilterConfig[];
  values: FilterValue[];
  onChange: (values: FilterValue[]) => void;
}

const operators = [
  { value: 'eq', label: 'Igual a' },
  { value: 'neq', label: 'Diferente de' },
  { value: 'contains', label: 'Contém' },
  { value: 'gt', label: 'Maior que' },
  { value: 'lt', label: 'Menor que' },
];

export const AdvancedFilters = memo(function AdvancedFilters({
  filters,
  values,
  onChange,
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);

  const addFilter = () => {
    if (filters.length === 0) return;
    onChange([
      ...values,
      { key: filters[0].key, operator: 'eq', value: '' },
    ]);
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
    setOpen(false);
  };

  const getFilterConfig = (key: string) => filters.find((f) => f.key === key);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-1" />
          Filtros
          {values.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {values.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96 p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">Filtros avançados</span>
            {values.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Limpar
              </Button>
            )}
          </div>

          {values.map((filter, index) => {
            const config = getFilterConfig(filter.key);
            return (
              <div key={index} className="flex gap-2 items-center">
                <Select
                  value={filter.key}
                  onValueChange={(v) => updateFilter(index, { key: v, value: '' })}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filter.operator}
                  onValueChange={(v) => updateFilter(index, { operator: v as FilterValue['operator'] })}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {config?.type === 'select' ? (
                  <Select
                    value={filter.value as string}
                    onValueChange={(v) => updateFilter(index, { value: v })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Valor" />
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
                    type={config?.type === 'number' ? 'number' : config?.type === 'date' ? 'date' : 'text'}
                    value={filter.value as string}
                    onChange={(e) => updateFilter(index, { value: e.target.value })}
                    placeholder="Valor"
                    className="flex-1"
                  />
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => removeFilter(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          <Button variant="outline" size="sm" className="w-full" onClick={addFilter}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar filtro
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
});

export default AdvancedFilters;
