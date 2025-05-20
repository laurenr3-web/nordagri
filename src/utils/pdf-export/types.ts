
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

// Add the InterventionReportPDFOptions type
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

// Define the props interface for InterventionReportPDF
export interface InterventionReportPDFProps {
  intervention: any; // Replace with your Intervention type
  companyName?: string;
  companyLogo?: string;
  companyDetails?: string;
  signature?: string;
  reportNotes?: string;
  actualDuration?: number;
  images?: string[];
  technician?: string;
}

// Add the PDFGenerationResult type with the filename property
export interface PDFGenerationResult {
  blob: Blob;
  url: string;
  filename: string;
  contentType?: string;
  download: () => void;
}
