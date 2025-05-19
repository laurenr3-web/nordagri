
import { Intervention } from '@/types/Intervention';

export interface InterventionReportPDFOptions {
  companyName?: string;
  companyLogo?: string;
  companyDetails?: string;
  signature?: string;
  reportNotes?: string;
  actualDuration?: number;
  images?: string[];
  technician?: string;
  filename?: string;
}

export interface TimeReportPDFOptions {
  employeeName: string;
  companyName?: string;
  companyLogo?: string;
  period: {
    start: Date;
    end: Date;
  };
}

// Ajout des types manquants
export interface TableHeader {
  key: string;
  label: string;
}

export interface TableData {
  headers: TableHeader[];
  rows: Record<string, any>[];
}

export interface TimeEntriesPDFProps {
  title: string;
  subtitle: string;
  tableData: TableData;
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
    name: string;
    hours: number;
  }>;
}

export interface PDFGenerationResult {
  url: string;
  blob: Blob;
  filename: string;
  contentType: string;
}
