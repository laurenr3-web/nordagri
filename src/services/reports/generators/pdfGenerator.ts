
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Intervention } from '@/types/Intervention';
import { InterventionReportOptions } from '../types/interventionReportTypes';
import { translateStatus, translatePriority } from '../utils/translationUtils';
import { addSection } from '../components/sectionHandlers';
import { addHeader, addFooter } from '../components/documentElements';
import { addPhotos, addSignature } from '../components/mediaHandlers';
import 'jspdf-autotable';

/**
 * Génère un rapport d'intervention en PDF
 */
export async function generateReport(
  intervention: Intervention,
  signature?: string,
  photos?: string[],
  options: InterventionReportOptions = {}
): Promise<Blob> {
  try {
    const doc = new jsPDF();
    
    // Définir les marges et les dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = margin;
    
    // Ajouter l'en-tête
    yPos = await addHeader(doc, options, yPos);
    
    // Titre du rapport
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport d\'Intervention', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Informations de base
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${format(new Date(intervention.date), 'dd/MM/yyyy', { locale: fr })}`, margin, yPos);
    doc.text(`Numéro: ${intervention.id}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 8;
    doc.text(`Statut: ${translateStatus(intervention.status)}`, margin, yPos);
    doc.text(`Priorité: ${translatePriority(intervention.priority)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 10;
    
    // Section Équipement
    yPos = addSection(doc, 'Informations sur l\'Équipement', yPos);
    
    const equipmentData = [
      ['Équipement', intervention.equipment],
      ['Emplacement', intervention.location || 'Non spécifié'],
      ['Technicien', intervention.technician || 'Non assigné']
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [],
      body: equipmentData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } }
    });
    
    yPos = doc.lastAutoTable.finalY + 10;
    
    // Section Description
    yPos = addSection(doc, 'Description du Problème', yPos);
    
    const pageHeight = doc.internal.pageSize.getHeight();
    const splitDescription = doc.splitTextToSize(
      intervention.description || 'Aucune description fournie',
      pageWidth - (margin * 2)
    );
    
    doc.setFontSize(10);
    doc.text(splitDescription, margin, yPos);
    yPos += splitDescription.length * 5 + 10;
    
    // Section Travaux Effectués
    if (intervention.status === 'completed' && intervention.notes) {
      yPos = addSection(doc, 'Travaux Effectués', yPos);
      
      const splitNotes = doc.splitTextToSize(
        intervention.notes || 'Aucun détail fourni',
        pageWidth - (margin * 2)
      );
      
      doc.setFontSize(10);
      doc.text(splitNotes, margin, yPos);
      yPos += splitNotes.length * 5 + 10;
    }
    
    // Section Pièces Utilisées
    if (options.includeParts && intervention.partsUsed && intervention.partsUsed.length > 0) {
      yPos = addSection(doc, 'Pièces Utilisées', yPos);
      
      // Vérifier s'il faut ajouter une nouvelle page
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.autoTable({
        startY: yPos,
        head: [['Référence', 'Pièce', 'Quantité']],
        body: intervention.partsUsed.map(part => [
          part.partId.toString(),
          part.name,
          part.quantity.toString()
        ]),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 9 }
      });
      
      yPos = doc.lastAutoTable.finalY + 10;
    }
    
    // Ajouter les photos
    if (options.includePhotos && photos && photos.length > 0) {
      yPos = await addPhotos(doc, photos, yPos);
    }
    
    // Ajouter la signature
    if (options.includeSignature && signature) {
      yPos = await addSignature(doc, signature, yPos);
    }
    
    // Ajouter le pied de page
    addFooter(doc, options);
    
    // Retourner le PDF sous forme de Blob
    return doc.output('blob');
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    throw error;
  }
}
