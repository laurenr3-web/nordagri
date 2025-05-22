
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

    console.log(`Blob PDF créé, taille: ${blob.size}`);

    // Télécharger le fichier PDF en utilisant file-saver
    saveAs(blob, `${filename}.pdf`);
    console.log(`Téléchargement du PDF lancé: ${filename}.pdf`);

    return Promise.resolve();
  } catch (error) {
    console.error("Erreur lors de la génération du rapport PDF:", error);
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
    console.log("Création du PDF des entrées de temps");

    // Generate PDF blob
    const blob = await pdf(
      <TimeEntriesPDF
        title={props.title}
        subtitle={props.subtitle}
        tableData={props.tableData}
      />
    ).toBlob();

    console.log(`Blob PDF créé, taille: ${blob.size}`);

    // Télécharger le fichier PDF
    saveAs(blob, `${filename}.pdf`);
    console.log(`Téléchargement du PDF lancé: ${filename}.pdf`);

    return Promise.resolve();
  } catch (error) {
    console.error("Erreur lors de la génération du PDF des entrées:", error);
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
    const blob = await pdf(documentElement).toBlob();
    const url = URL.createObjectURL(blob);
    
    return {
      blob,
      url,
      filename: `${filename}.pdf`,
      contentType: 'application/pdf',
      download: () => {
        saveAs(blob, `${filename}.pdf`);
      }
    };
  } catch (error) {
    console.error("Erreur lors de la création du PDF:", error);
    throw error;
  }
};
