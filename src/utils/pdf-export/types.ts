
import { Intervention } from '@/types/Intervention';

export interface InterventionReportPDFOptions {
  reportNotes?: string;
  actualDuration?: number;
  signature?: string;
  images?: string[];
  includeCustomerInfo?: boolean;
  includeCompanyLogo?: boolean;
  includePartsSection?: boolean;
  templateType?: 'standard' | 'detailed' | 'simple';
}

export interface PDFGenerationResult {
  url: string;
  blob: Blob;
  filename: string;
  contentType: string;
}

export interface PDFExportService {
  generatePDF(intervention: Intervention, options?: InterventionReportPDFOptions): Promise<PDFGenerationResult>;
  downloadPDF(intervention: Intervention, options?: InterventionReportPDFOptions): Promise<void>;
  sendByEmail(intervention: Intervention, email: string, options?: InterventionReportPDFOptions & {
    subject?: string;
    message?: string;
  }): Promise<boolean>;
}

// Adding missing types for time tracking PDF export
export interface TableData {
  headers: Array<{ key: string; label: string }>;
  rows: Array<Record<string, any>>;
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
