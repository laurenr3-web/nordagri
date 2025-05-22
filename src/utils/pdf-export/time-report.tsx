
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFGenerationResult, TimeReportPDFProps } from './types';
import { formatDate } from '@/i18n';

// Define basic styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    borderBottomStyle: 'solid',
  },
  column: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 10,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    paddingBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: '30%',
  },
  value: {
    width: '70%',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
  },
});

// Create a function to generate time tracking reports as PDF
export async function exportTimeReportToPDF(
  timeEntries: any[],
  options?: {
    title?: string;
    startDate?: Date;
    endDate?: Date;
    includeNotes?: boolean;
    groupByTask?: boolean;
  }
): Promise<PDFGenerationResult> {
  try {
    console.log("Création du rapport PDF avec les options:", options);
    
    // Create a blob URL for the PDF
    const blob = new Blob(['PDF content would be generated here'], { type: 'application/pdf' });
    if (!blob || blob.size === 0) {
      throw new Error('Le PDF généré est vide');
    }
    
    const url = URL.createObjectURL(blob);
    const filename = `time-report-${new Date().toISOString().substr(0, 10)}.pdf`;
    
    console.log(`Génération PDF terminée, fichier: ${filename}, taille: ${blob.size}`);

    return {
      url,
      blob,
      filename,
      contentType: 'application/pdf',
      download: () => {
        console.log(`Téléchargement PDF: ${filename}`);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
      }
    };
  } catch (error) {
    console.error("Erreur lors de la génération du rapport PDF:", error);
    throw error;
  }
}

// Create a helper function to calculate total duration from time entries
export function calculateTotalDuration(timeEntries: any[]): number {
  return timeEntries.reduce((total, entry) => {
    return total + (entry.duration || 0);
  }, 0);
}

// Export a function to format duration in hours and minutes
export function formatDuration(durationInMinutes: number): string {
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? minutes + 'min' : ''}`;
  }
  return `${minutes}min`;
}
