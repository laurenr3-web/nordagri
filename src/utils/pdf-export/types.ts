
// Define types for PDF exports

export interface TableData {
  headers: Array<{
    key: string;
    label: string;
  }>;
  rows: Array<Record<string, any>>;
}

export interface TimeReportPDFOptions {
  filename?: string;
}

export interface TimeReportPDFProps {
  month: string;
  summary: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  taskDistribution: Array<{
    type: string;
    hours: number;
    percentage: number;
  }>;
  topEquipment: Array<{
    id?: number;
    name: string;
    hours: number;
  }>;
}

export interface TimeEntriesPDFProps {
  title: string;
  subtitle: string;
  tableData: TableData;
}
