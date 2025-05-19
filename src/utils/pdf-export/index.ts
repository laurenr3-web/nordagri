
import { Intervention } from '@/types/Intervention';
import { InterventionReportPDFOptions } from './types';
import { exportInterventionToPDF as exportReport, sendInterventionReportByEmail as sendReportByEmail } from './intervention-report';
import { exportTimeReportToPDF } from './time-report';

export interface ExportOptions {
  reportNotes?: string;
  actualDuration?: number;
  signature?: string;
  images?: string[];
}

export async function exportInterventionToPDF(intervention: Intervention, options?: ExportOptions): Promise<void> {
  return exportReport(intervention, options);
}

export async function sendInterventionReportByEmail(
  intervention: Intervention,
  email: string,
  options?: ExportOptions & { subject?: string; message?: string }
): Promise<boolean> {
  return sendReportByEmail(intervention, email, options);
}

// Re-export the time report function
export { exportTimeReportToPDF };
