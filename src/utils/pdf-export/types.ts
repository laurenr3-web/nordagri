
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

// Ajout des types nécessaires pour les autres fichiers
export interface TimeEntriesPDFProps {
  timeEntries: any[];  // Remplacer par le type correct
  options?: TimeReportPDFOptions;
}

export interface TimeReportPDFProps {
  timeEntries: any[];  // Remplacer par le type correct
  options?: TimeReportPDFOptions;
}

export interface TableData {
  headers: string[];
  rows: any[][];
}
