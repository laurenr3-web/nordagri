
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { TimeReportPDF } from '@/components/time-tracking/reports/TimeReportPDF';
import { TimeEntriesPDF } from '@/components/time-tracking/reports/TimeEntriesPDF';
import { PDFGenerationResult } from './types';

/**
 * Generate and download a PDF report of time tracking summary
 */
export const exportTimeReportToPDF = async (
  month: string,
  summary: {
    daily: number;
    weekly: number;
    monthly: number;
  },
  taskDistribution: Array<{
    type: string;
    hours: number;
    percentage: number;
  }>,
  topEquipment: Array<{
    id?: number;
    name: string;
    hours: number;
  }>,
  filename = 'time-report'
): Promise<void> => {
  try {
    // Verify that component exists
    if (!TimeReportPDF) {
      throw new Error('Composant TimeReportPDF non trouvé');
    }
    
    console.log("Création du rapport PDF avec les données:", {
      month,
      summary,
      taskDistributionLength: taskDistribution.length,
      topEquipmentLength: topEquipment.length
    });

    // Generate PDF blob
    const blob = await pdf(
      <TimeReportPDF
        month={month}
        summary={summary}
        taskDistribution={taskDistribution}
        topEquipment={topEquipment}
      />
    ).toBlob();

    // Verify blob is valid
    if (!blob || blob.size === 0) {
      throw new Error('Le PDF généré est vide');
    }

    console.log(`Blob PDF créé, taille: ${blob.size}`);

    // Télécharger le fichier PDF en utilisant file-saver
    saveAs(blob, `${filename}.pdf`);
    console.log(`Téléchargement du PDF lancé: ${filename}.pdf`);

    return Promise.resolve();
  } catch (error) {
    console.error("Erreur détaillée lors de la génération du rapport PDF:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "Pas de stack disponible");
    throw error;
  }
};

/**
 * Generate and download a PDF of time entries
 */
export const exportTimeEntriesToPDF = async (
  props: {
    title: string;
    subtitle: string;
    tableData: {
      headers: Array<{
        key: string;
        label: string;
      }>;
      rows: Array<Record<string, any>>;
    }
  },
  filename = 'time-entries'
): Promise<void> => {
  try {
    // Verify that component exists
    if (!TimeEntriesPDF) {
      throw new Error('Composant TimeEntriesPDF non trouvé');
    }
    
    console.log("Création du PDF des entrées de temps avec les données:", {
      title: props.title,
      subtitle: props.subtitle,
      tableHeaders: props.tableData.headers.length,
      tableRows: props.tableData.rows.length
    });

    // Generate PDF blob
    const blob = await pdf(
      <TimeEntriesPDF
        title={props.title}
        subtitle={props.subtitle}
        tableData={props.tableData}
      />
    ).toBlob();

    // Verify blob is valid
    if (!blob || blob.size === 0) {
      throw new Error('Le PDF généré est vide');
    }

    console.log(`Blob PDF créé, taille: ${blob.size}`);

    // Télécharger le fichier PDF
    saveAs(blob, `${filename}.pdf`);
    console.log(`Téléchargement du PDF lancé: ${filename}.pdf`);

    return Promise.resolve();
  } catch (error) {
    console.error("Erreur détaillée lors de la génération du PDF des entrées:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "Pas de stack disponible");
    throw error;
  }
};

/**
 * Utility function to create a downloadable PDF and return a result object
 */
export const createPDF = async (
  documentElement: React.ReactElement,
  filename = 'document'
): Promise<PDFGenerationResult> => {
  try {
    console.log(`Création du PDF: ${filename}`);
    
    if (!documentElement) {
      throw new Error('Élément React non fourni pour la génération PDF');
    }
    
    const blob = await pdf(documentElement).toBlob();
    
    // Verify blob is valid
    if (!blob || blob.size === 0) {
      throw new Error('Le PDF généré est vide');
    }
    
    console.log(`PDF généré avec succès, taille: ${blob.size} octets`);
    
    const url = URL.createObjectURL(blob);
    
    return {
      blob,
      url,
      filename: `${filename}.pdf`,
      contentType: 'application/pdf',
      download: () => {
        console.log(`Téléchargement du PDF: ${filename}.pdf`);
        saveAs(blob, `${filename}.pdf`);
      }
    };
  } catch (error) {
    console.error("Erreur détaillée lors de la création du PDF:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "Pas de stack disponible");
    throw error;
  }
};
