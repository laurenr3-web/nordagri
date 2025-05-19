
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
