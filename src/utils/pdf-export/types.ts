
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
