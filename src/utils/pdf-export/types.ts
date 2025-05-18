
import { Intervention } from '@/types/Intervention';

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
    name: string;
    hours: number;
  }>;
}

export interface TableData {
  headers: { key: string; label: string }[];
  rows: Record<string, any>[];
}

export interface TimeEntriesPDFProps {
  title: string;
  subtitle: string;
  tableData: TableData;
}

export interface InterventionReportPDFOptions {
  reportNotes?: string;
  actualDuration?: number;
}
