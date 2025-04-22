
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExcelColumn {
  key: string;
  header: string;
}

export const exportToExcel = (
  data: any[],
  columns: ExcelColumn[],
  filename: string = 'export',
  sheetName: string = 'Données'
): void => {
  // Create headers row
  const headers = columns.map(col => col.header);
  
  // Transform data to rows
  const rows = data.map(item => {
    return columns.map(col => item[col.key] || '');
  });
  
  // Combine headers and rows
  const excelData = [headers, ...rows];
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate Excel file and save it
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
  saveAs(blob, `${filename}.xlsx`);
};

export const formatDataForExcel = <T extends Record<string, any>>(
  data: T[],
  transformFunction?: (item: T) => any
): any[] => {
  if (!data || data.length === 0) return [];
  
  if (transformFunction) {
    return data.map(transformFunction);
  }
  
  return data;
};
