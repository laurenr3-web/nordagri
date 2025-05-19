
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

export interface TimeReportPDFOptions {
  companyName?: string;
  companyLogo?: string;
  periodName?: string;
  employeeName?: string;
  notes?: string;
}

// Types for time entries PDF
export interface TimeEntriesPDFProps {
  timeEntries: any[];  // Remplacer par le type correct
  options?: TimeReportPDFOptions;
  title?: string;
  subtitle?: string;
  tableData?: TableData;
}

export interface TimeReportPDFProps {
  timeEntries: any[];  // Remplacer par le type correct
  options?: TimeReportPDFOptions;
  month?: string;
  summary?: any;
  taskDistribution?: any;
  topEquipment?: any;
}

export interface TableData {
  headers: string[];
  rows: any[][];
}

// Type for Intervention used in PDF reports
export interface InterventionForPDF {
  id: number;
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  priority?: string;
  equipment?: {
    id: number;
    name: string;
    serialNumber?: string;
    model?: string;
  };
  partsUsed?: PartUsed[];
  notes?: string;
}

export interface PartUsed {
  id: number;
  name: string;
  quantity: number;
  unitPrice?: number;
}
