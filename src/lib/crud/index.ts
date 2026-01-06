// CRUD Toolkit - Índice de Exports
// Hooks
export { useCRUD } from '@/hooks/useCRUD';
export { useSavedFilters } from '@/hooks/useSavedFilters';
export { useDuplicate } from '@/hooks/useDuplicate';
export { useBulkActions } from '@/hooks/useBulkActions';
export { useSearch } from '@/hooks/useSearch';
export { useVersions } from '@/hooks/useVersions';
export { useExportData } from '@/hooks/useExportData';
export { useImportData } from '@/hooks/useImportData';
export { useDebounce } from '@/hooks/useDebounce';
export { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

// Components
export { DataImporter } from '@/components/DataImporter';
export { SavedFiltersDropdown } from '@/components/SavedFiltersDropdown';
export { AdvancedFilters } from '@/components/AdvancedFilters';
export { SearchInput } from '@/components/SearchInput';
export { BulkActionsBar } from '@/components/BulkActionsBar';
export { DuplicateButton } from '@/components/DuplicateButton';
export { VersionHistory } from '@/components/VersionHistory';
export { ConfirmDialog } from '@/components/ConfirmDialog';
export { LoadingOverlay } from '@/components/LoadingOverlay';

// Utilities
export { exportToExcel, importExcel, generateCSVTemplate, importCSV } from '@/lib/excelImporter';

// Types
export type { FilterValue, FilterConfig } from '@/components/AdvancedFilters';
export type { BulkAction } from '@/hooks/useBulkActions';
