/**
 * Componente de Importação de Dados
 */

import { useState, useCallback, ReactNode } from 'react';
import { z, ZodSchema } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, AlertCircle, CheckCircle2, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { importExcel, generateCSVTemplate } from '@/lib/excelImporter';

interface ColumnConfig {
  key: string;
  label: string;
  required?: boolean;
}

interface DataImporterProps<T> {
  schema: ZodSchema<T>;
  columns: ColumnConfig[];
  onImport: (data: T[]) => Promise<void>;
  templateName?: string;
  title?: string;
  description?: string;
  trigger?: ReactNode;
  onSuccess?: () => void;
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
}

interface ParsedRow {
  data: Record<string, unknown>;
  errors: ValidationError[];
  isValid: boolean;
}

export function DataImporter<T>({
  schema,
  columns,
  onImport,
  templateName = 'template',
  title = 'Importar Dados',
  description = 'Faça upload de um arquivo Excel ou CSV para importar dados.',
  trigger,
  onSuccess,
}: DataImporterProps<T>) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);
    setProgress(10);

    try {
      // Build column mapping from config
      const columnMapping: Record<string, string> = {};
      columns.forEach(col => {
        columnMapping[col.label] = col.key;
      });

      const rawData = await importExcel<Record<string, unknown>>(selectedFile, columnMapping as Record<string, keyof Record<string, unknown>>);
      setProgress(50);

      const parsed: ParsedRow[] = rawData.map((row, index) => {
        const errors: ValidationError[] = [];
        
        try {
          schema.parse(row);
          return { data: row as Record<string, unknown>, errors: [], isValid: true };
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.errors.forEach((err) => {
              errors.push({
                row: index + 1,
                column: err.path.join('.'),
                message: err.message,
              });
            });
          }
          return { data: row as Record<string, unknown>, errors, isValid: false };
        }
      });

      setParsedData(parsed);
      setProgress(100);
      setStep('preview');
    } catch {
      toast.error('Erro ao processar arquivo');
    } finally {
      setIsLoading(false);
    }
  }, [schema]);

  const handleImport = async () => {
    const validData = parsedData.filter((row) => row.isValid).map((row) => row.data as T);
    
    if (validData.length === 0) {
      toast.error('Nenhum dado válido para importar');
      return;
    }

    setStep('importing');
    setProgress(0);

    try {
      await onImport(validData);
      setProgress(100);
      setStep('complete');
      toast.success(`${validData.length} registros importados com sucesso!`);
      onSuccess?.();
    } catch {
      toast.error('Erro ao importar dados');
      setStep('preview');
    }
  };

  const handleDownloadTemplate = () => {
    generateCSVTemplate(columns, templateName);
    toast.success('Template baixado!');
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setParsedData([]);
    setStep('upload');
    setProgress(0);
  };

  const validCount = parsedData.filter((r) => r.isValid).length;
  const errorCount = parsedData.filter((r) => !r.isValid).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Clique para selecionar ou arraste um arquivo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos suportados: Excel (.xlsx, .xls) ou CSV
                </p>
              </label>
            </div>
            
            <Button variant="outline" onClick={handleDownloadTemplate} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Baixar Template
            </Button>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <Alert variant={validCount > 0 ? "default" : "destructive"}>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>{validCount} válidos</AlertTitle>
              </Alert>
              {errorCount > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{errorCount} com erros</AlertTitle>
                </Alert>
              )}
            </div>

            <div className="max-h-60 overflow-auto border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {columns.slice(0, 4).map((col) => (
                      <TableHead key={col.key}>{col.label}</TableHead>
                    ))}
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 10).map((row, idx) => (
                    <TableRow key={idx} className={row.isValid ? '' : 'bg-destructive/10'}>
                      <TableCell>{idx + 1}</TableCell>
                      {columns.slice(0, 4).map((col) => (
                        <TableCell key={col.key} className="max-w-32 truncate">
                          {String(row.data[col.key] ?? '-')}
                        </TableCell>
                      ))}
                      <TableCell>
                        {row.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {(step === 'importing' || isLoading) && (
          <div className="py-8">
            <Progress value={progress} className="mb-4" />
            <p className="text-center text-sm text-muted-foreground">
              {step === 'importing' ? 'Importando dados...' : 'Processando arquivo...'}
            </p>
          </div>
        )}

        {step === 'complete' && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Importação concluída!</AlertTitle>
            <AlertDescription>
              {validCount} registros foram importados com sucesso.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            {step === 'complete' ? 'Fechar' : 'Cancelar'}
          </Button>
          {step === 'preview' && validCount > 0 && (
            <Button onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Importar {validCount} registros
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DataImporter;
