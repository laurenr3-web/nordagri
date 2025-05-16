
import { jsPDF } from 'jspdf';
import { InterventionReportOptions } from '../types/interventionReportTypes';

/**
 * Ajoute l'en-tête au document
 */
export async function addHeader(doc: jsPDF, options: InterventionReportOptions, yPos: number): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  
  if (options.farmLogo) {
    try {
      // Charger le logo
      const response = await fetch(options.farmLogo);
      const arrayBuffer = await response.arrayBuffer();
      // Convertir ArrayBuffer en Uint8Array pour compatibilité avec jsPDF
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const logoFormat = options.farmLogo.split('.').pop()?.toLowerCase() || 'png';
      
      // Ajouter le logo
      doc.addImage(
        uint8Array,
        logoFormat,
        margin,
        yPos,
        40,
        20,
        undefined,
        'FAST'
      );
      
      // Informations de l'exploitation
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(options.farmName || 'NordAgri', pageWidth - margin, yPos + 10, { align: 'right' });
      
      if (options.contactInfo) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        if (options.contactInfo.address) {
          doc.text(options.contactInfo.address, pageWidth - margin, yPos + 15, { align: 'right' });
        }
        if (options.contactInfo.phone) {
          doc.text(`Tél: ${options.contactInfo.phone}`, pageWidth - margin, yPos + 19, { align: 'right' });
        }
      }
      
      return yPos + 30;
    } catch (error) {
      console.error('Erreur lors du chargement du logo:', error);
      // En cas d'erreur, continuer sans logo
      return yPos + 10;
    }
  } else {
    // En-tête sans logo
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(options.farmName || 'NordAgri', pageWidth / 2, yPos + 10, { align: 'center' });
    return yPos + 20;
  }
}

/**
 * Ajoute le pied de page au document
 */
export function addFooter(doc: jsPDF, options: InterventionReportOptions): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Ajouter un pied de page à chaque page
  const totalPages = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Ligne séparatrice
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
    
    // Informations de contact
    if (options.includeContact && options.contactInfo) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      
      let contactText = options.farmName || 'NordAgri';
      
      if (options.contactInfo.address) {
        contactText += ` - ${options.contactInfo.address}`;
      }
      if (options.contactInfo.phone) {
        contactText += ` - Tél: ${options.contactInfo.phone}`;
      }
      if (options.contactInfo.email) {
        contactText += ` - Email: ${options.contactInfo.email}`;
      }
      
      doc.text(contactText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
    
    // Numéro de page
    doc.setFontSize(8);
    doc.text(`Page ${i} / ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
  }
}
