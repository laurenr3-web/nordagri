
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
      companyName={options?.companyName}
      companyLogo={options?.companyLogo}
      companyDetails={options?.companyDetails}
      signature={options?.signature}
      reportNotes={options?.reportNotes}
      actualDuration={options?.actualDuration}
      images={options?.images}
      technician={options?.technician}
    />
  ).toBlob();
  
  saveAs(blob, `${filename || defaultFilename}.pdf`);
};

// Helper function to send report via email
export const sendInterventionReportByEmail = async (
  intervention: Intervention,
  recipientEmail: string,
  options?: InterventionReportPDFOptions & {
    subject?: string;
    message?: string;
  }
): Promise<boolean> => {
  try {
    const blob = await pdf(
      <InterventionReportPDF
        intervention={intervention}
        companyName={options?.companyName}
        companyLogo={options?.companyLogo}
        companyDetails={options?.companyDetails}
        signature={options?.signature}
        reportNotes={options?.reportNotes}
        actualDuration={options?.actualDuration}
        images={options?.images}
        technician={options?.technician}
      />
    ).toBlob();
    
    const subject = options?.subject || `Rapport d'intervention #${intervention.id}`;
    const message = options?.message || 
      `Veuillez trouver ci-joint le rapport d'intervention #${intervention.id} réalisée le ${
        typeof intervention.date === 'string' 
          ? new Date(intervention.date).toLocaleDateString()
          : intervention.date.toLocaleDateString()
      }`;
    
    // Here you would normally call your email API
    // This is a placeholder for the integration with your emailing system
    console.log(`Sending report to ${recipientEmail} with subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log(`Attachment: PDF blob of size ${blob.size}`);
    
    // For demonstration, we'll always return true
    // In a real implementation, you would integrate with an email sending API
    return true;
  } catch (error) {
    console.error('Error sending report by email:', error);
    return false;
  }
};
