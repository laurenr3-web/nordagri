
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { InterventionReportPDF } from '@/components/interventions/reports/InterventionReportPDF';
import { Intervention } from '@/types/Intervention';
import { InterventionReportPDFOptions } from './types';

export const exportInterventionToPDF = async (
  intervention: Intervention,
  options?: InterventionReportPDFOptions,
  filename?: string
): Promise<void> => {
  const dateStr = typeof intervention.date === 'string' 
    ? new Date(intervention.date).toISOString().split('T')[0]
    : intervention.date.toISOString().split('T')[0];
  
  const defaultFilename = `intervention-${intervention.id}-${dateStr}`;
  
  const blob = await pdf(
    <InterventionReportPDF
      intervention={intervention}
      reportNotes={options?.reportNotes}
      actualDuration={options?.actualDuration}
    />
  ).toBlob();
  
  saveAs(blob, `${filename || defaultFilename}.pdf`);
};
