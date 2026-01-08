import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bookmark, ChevronDown, Trash2 } from 'lucide-react';
import { useSavedFilters } from '@/hooks/useSavedFilters';
import { toast } from 'sonner';

interface SavedFiltersDropdownProps {
  entityType: string;
  currentFilters: Record<string, unknown>;
  onApplyFilter: (filters: Record<string, unknown>) => void;
}

export const SavedFiltersDropdown = memo(function SavedFiltersDropdown({
  entityType,
  currentFilters,
  onApplyFilter,
}: SavedFiltersDropdownProps) {
  const { filters: savedFilters, saveFilter, deleteFilter, isLoading } = useSavedFilters(entityType);
  const [filterName, setFilterName] = useState('');

  const handleSave = () => {
    if (!filterName.trim()) {
      toast.error('Digite um nome para o filtro');
      return;
    }
    saveFilter({
      name: filterName,
      filters: currentFilters,
    });
    setFilterName('');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <Bookmark className="h-4 w-4 mr-1" />
          Filtros
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Filtros salvos</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {savedFilters.length === 0 ? (
          <DropdownMenuItem disabled>Nenhum filtro salvo</DropdownMenuItem>
        ) : (
          savedFilters.map((filter) => (
            <DropdownMenuItem
              key={filter.id}
              className="flex justify-between items-center"
            >
              <span 
                className="flex-1 cursor-pointer"
                onClick={() => onApplyFilter(filter.filters as Record<string, unknown>)}
              >
                {filter.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFilter(filter.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <div className="p-2 space-y-2">
          <input
            type="text"
            placeholder="Nome do filtro"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded"
          />
          <Button size="sm" className="w-full" onClick={handleSave}>
            Salvar filtro atual
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export default SavedFiltersDropdown;
