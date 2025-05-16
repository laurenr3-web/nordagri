
import { jsPDF } from 'jspdf';

/**
 * Ajoute une section au rapport
 */
export function addSection(doc: jsPDF, title: string, yPos: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  
  // Vérifier s'il faut ajouter une nouvelle page
  if (yPos > pageHeight - 40) {
    doc.addPage();
    yPos = margin;
  }
  
  // Titre de section
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text(title, margin + 4, yPos + 5.5);
  
  return yPos + 12;
}
