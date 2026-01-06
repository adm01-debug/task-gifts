import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, RefreshCw, CheckSquare, Play } from 'lucide-react';
import { SearchInput } from '@/components/SearchInput';
import { SavedFiltersDropdown } from '@/components/SavedFiltersDropdown';
import { AdvancedFilters, FilterValue, FilterConfig } from '@/components/AdvancedFilters';
import { DataImporter } from '@/components/DataImporter';
import { BulkActionsBar, SimpleBulkAction } from '@/components/BulkActionsBar';
import { tarefaSchema, taskGiftsImportTemplates, taskGiftsFilterConfigs } from '@/lib/taskGiftsSchemas';
import { exportToExcel } from '@/lib/excelImporter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TarefasToolbarProps {
  onSearch: (term: string) => void;
  onFiltersChange: (filters: FilterValue[]) => void;
  onRefresh: () => void;
  onNewClick: () => void;
  selectedCount: number;
  onClearSelection: () => void;
  onBulkConcluir: () => void;
  onBulkIniciar: () => void;
  currentFilters: Record<string, unknown>;
  data?: unknown[];
}

export const TarefasToolbar = memo(function TarefasToolbar({ 
  onSearch, 
  onFiltersChange, 
  onRefresh, 
  onNewClick, 
  selectedCount, 
  onClearSelection, 
  onBulkConcluir, 
  onBulkIniciar, 
  currentFilters, 
  data = [] 
}: TarefasToolbarProps) {
  const [filterValues, setFilterValues] = useState<FilterValue[]>([]);

  const handleImport = async (tarefas: unknown[]) => {
    const { error } = await supabase.from('tarefas' as 'profiles').insert(tarefas as never);
    if (error) throw error;
    toast.success(`${(tarefas as unknown[]).length} tarefas importadas!`);
    onRefresh();
  };

  const handleExport = () => {
    if (data.length === 0) { 
      toast.warning('Nenhum dado'); 
      return; 
    }
    exportToExcel(data as Record<string, unknown>[], [
      { key: 'titulo' as keyof Record<string, unknown>, label: 'Título' },
      { key: 'responsavel_nome' as keyof Record<string, unknown>, label: 'Responsável' },
      { key: 'prioridade' as keyof Record<string, unknown>, label: 'Prioridade' },
      { key: 'status' as keyof Record<string, unknown>, label: 'Status' },
      { key: 'data_vencimento' as keyof Record<string, unknown>, label: 'Vencimento' },
    ], 'tarefas', 'Tarefas');
    toast.success('Exportado!');
  };

  const bulkActions: SimpleBulkAction[] = [
    { key: 'iniciar', label: 'Iniciar', icon: <Play className="h-4 w-4" />, onClick: onBulkIniciar },
    { key: 'concluir', label: 'Concluir', icon: <CheckSquare className="h-4 w-4" />, onClick: onBulkConcluir },
  ];

  return (
    <div className="space-y-3">
      {selectedCount > 0 && (
        <BulkActionsBar 
          selectedCount={selectedCount} 
          onClearSelection={onClearSelection} 
          actions={bulkActions} 
        />
      )}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <SearchInput 
            onSearch={onSearch} 
            placeholder="Buscar tarefa..." 
            className="w-64" 
          />
          <AdvancedFilters 
            filters={taskGiftsFilterConfigs.tarefas as FilterConfig[]} 
            values={filterValues} 
            onChange={(v) => { 
              setFilterValues(v); 
              onFiltersChange(v); 
            }} 
          />
          <SavedFiltersDropdown 
            entityType="tarefas" 
            currentFilters={currentFilters} 
            onApplyFilter={(f) => { 
              const values = Object.entries(f).map(([k, v]) => ({ 
                key: k, 
                operator: 'eq' as const, 
                value: v 
              })); 
              setFilterValues(values); 
              onFiltersChange(values); 
            }} 
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <DataImporter 
            schema={tarefaSchema} 
            columns={taskGiftsImportTemplates.tarefas} 
            onImport={handleImport} 
            templateName="tarefas" 
            title="Importar Tarefas" 
            trigger={
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4" />
              </Button>
            } 
            onSuccess={onRefresh} 
          />
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={onNewClick}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

export default TarefasToolbar;
