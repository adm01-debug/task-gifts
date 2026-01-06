/**
 * Excel Importer/Exporter Utility
 * 
 * @module lib/excelImporter
 * @description Import/Export Excel and CSV files
 */

import * as XLSX from 'xlsx';

// ============================================
// TIPOS
// ============================================

export interface ExportColumn<T> {
  key: keyof T;
  label: string;
  format?: (value: unknown) => string;
}

// ============================================
// EXPORT TO EXCEL
// ============================================

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string,
  sheetName: string = 'Dados'
): void {
  if (data.length === 0) return;

  // Prepare data with formatted values
  const formattedData = data.map(row => {
    const formatted: Record<string, unknown> = {};
    columns.forEach(col => {
      const value = row[col.key];
      formatted[col.label] = col.format ? col.format(value) : value;
    });
    return formatted;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
  // Adjust column widths
  const colWidths = columns.map(col => ({
    wch: Math.max(col.label.length, 15),
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

// ============================================
// IMPORT EXCEL
// ============================================

export async function importExcel<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          defval: '',
          raw: false,
        }) as T[];
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}

// ============================================
// GENERATE CSV TEMPLATE
// ============================================

export function generateCSVTemplate(columns: { key: string; label: string; example?: string }[]): void {
  const headers = columns.map(c => c.label);
  const examples = columns.map(c => c.example || '');
  
  const csvContent = [
    headers.join(','),
    examples.join(','),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'template.csv';
  link.click();
  URL.revokeObjectURL(url);
}

// ============================================
// IMPORT CSV
// ============================================

export async function importCSV<T>(file: File): Promise<T[]> {
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
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
        const results: T[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          const row: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || '';
          });
          
          results.push(row as T);
        }
        
        resolve(results);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file, 'utf-8');
  });
}
