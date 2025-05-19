
// Types for the PDF report generation

// Options for generating PDF reports
export interface PDFGenerationOptions {
  filename?: string;
}

// Result of a PDF generation operation
export interface PDFGenerationResult {
  url: string;
  blob: Blob;
  filename: string;
  contentType: string;
}

// Options for time report PDF generation
export interface TimeReportPDFOptions extends PDFGenerationOptions {
  includeTaskDistribution?: boolean;
  includeTopEquipment?: boolean;
}

// Props for TimeReportPDF component
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
    percentage?: number;
  }>;
  topEquipment: Array<{
    id?: number;
    name: string;
    hours: number;
  }>;
}

// Table data for PDF generation
export interface TableData {
  headers: Array<{
    key: string;
    label: string;
  }>;
  rows: Array<Record<string, any>>;
}

// Options for generating intervention report PDFs
export interface InterventionReportPDFOptions {
  companyName?: string;
  companyLogo?: string;
  companyDetails?: string;
  signature?: string;
  reportNotes?: string;
  actualDuration?: number;
  images?: string[];
  technician?: string;
}
