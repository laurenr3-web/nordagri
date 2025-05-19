
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
