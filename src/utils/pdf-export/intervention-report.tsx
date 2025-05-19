
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { InterventionReportPDF } from '@/components/interventions/reports/InterventionReportPDF';
import { Intervention } from '@/types/Intervention';
import { InterventionReportPDFOptions } from './types';

export const exportInterventionToPDF = async (
  intervention: Intervention,
  options?: InterventionReportPDFOptions & { filename?: string }
): Promise<void> => {
  try {
    console.log("Début de la génération du PDF pour l'intervention:", intervention.id);
    
    // Format de date pour le nom de fichier
    const dateStr = typeof intervention.date === 'string' 
      ? new Date(intervention.date).toISOString().split('T')[0]
      : intervention.date instanceof Date 
        ? intervention.date.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
    
    const defaultFilename = `intervention-${intervention.id}-${dateStr}`;
    const filename = options?.filename || defaultFilename;
    
    console.log("Création du document PDF avec React-PDF");
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
    
    console.log("Blob PDF créé, taille:", blob.size);
    
    // Télécharger le fichier PDF
    saveAs(blob, `${filename}.pdf`);
    console.log("Téléchargement du PDF initié:", `${filename}.pdf`);
    
    return Promise.resolve();
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    throw error;
  }
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
    console.log("Début de la génération du PDF pour envoi par email");
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
          : intervention.date instanceof Date
            ? intervention.date.toLocaleDateString()
            : new Date().toLocaleDateString()
      }`;
    
    console.log(`Envoi du rapport à ${recipientEmail} avec sujet: ${subject}`);
    console.log(`Message: ${message}`);
    console.log(`Pièce jointe: PDF blob de taille ${blob.size}`);
    
    // Pour démonstration, nous retournons toujours true
    // Dans une implémentation réelle, vous intégreriez avec une API d'envoi d'email
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du rapport par email:', error);
    return false;
  }
};
