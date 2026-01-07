/**
 * Excel/CSV Import/Export Utilities
 * Utilities for importing and exporting data in Excel and CSV formats
 */

import * as XLSX from 'xlsx';

export interface ColumnConfig<T> {
  key: keyof T;
  label: string;
}

/**
 * Export data to Excel file
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ColumnConfig<T>[],
  filename: string,
  sheetName: string = 'Dados'
): void {
  if (data.length === 0) return;

  // Create worksheet data with headers
  const headers = columns.map(col => col.label);
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key];
      if (value === null || value === undefined) return '';
      if (value instanceof Date) return value.toISOString().split('T')[0];
      return String(value);
    })
  );

  const wsData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate and download file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Import data from Excel file
 */
export async function importExcel<T>(
  file: File,
  columnMapping: Record<string, keyof T>
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);

        // Map columns
        const mappedData = jsonData.map(row => {
          const mapped: Partial<T> = {};
          for (const [excelCol, targetKey] of Object.entries(columnMapping)) {
            if (row[excelCol] !== undefined) {
              mapped[targetKey as keyof T] = row[excelCol] as T[keyof T];
            }
          }
          return mapped as T;
        });

        resolve(mappedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generate CSV template for import
 */
export function generateCSVTemplate(
  columns: { key: string; label: string; example?: string }[],
  filename: string
): void {
  const headers = columns.map(col => col.label).join(',');
  const examples = columns.map(col => col.example || '').join(',');
  const content = `${headers}\n${examples}`;

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_template.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Import data from CSV file
 */
export async function importCSV<T>(
  file: File,
  columnMapping: Record<string, keyof T>
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          resolve([]);
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const data: T[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: Partial<T> = {};

          headers.forEach((header, index) => {
            const targetKey = columnMapping[header];
            if (targetKey && values[index] !== undefined) {
              row[targetKey as keyof T] = values[index] as T[keyof T];
            }
          });

          data.push(row as T);
        }

        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
