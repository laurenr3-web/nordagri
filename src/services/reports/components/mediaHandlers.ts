
import { jsPDF } from 'jspdf';
import { addSection } from './sectionHandlers';

/**
 * Ajoute des photos au rapport
 */
export async function addPhotos(doc: jsPDF, photos: string[], yPos: number): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  
  // Ajouter une section pour les photos
  yPos = addSection(doc, 'Photos d\'Intervention', yPos);
  
  // Vérifier s'il faut ajouter une nouvelle page
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = margin;
  }
  
  const photoWidth = (pageWidth - margin * 2 - 10) / 2; // 2 photos par ligne avec espacement
  const photoHeight = photoWidth * 0.75; // Ratio 4:3
  
  try {
    for (let i = 0; i < photos.length; i++) {
      // Nouvelle page si nécessaire
      if (yPos + photoHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      
      // Position X (alterné pour avoir 2 photos par ligne)
      const xPos = i % 2 === 0 ? margin : margin + photoWidth + 10;
      
      // Nouvelle ligne après 2 photos
      if (i % 2 === 0 && i > 0) {
        yPos += photoHeight + 10;
      }
      
      // Charger et ajouter la photo
      try {
        const response = await fetch(photos[i]);
        const arrayBuffer = await response.arrayBuffer();
        // Convertir ArrayBuffer en Uint8Array pour compatibilité avec jsPDF
        const uint8Array = new Uint8Array(arrayBuffer);
        
        doc.addImage(
          uint8Array,
          'JPEG', // Supposer que toutes les photos sont JPG
          xPos,
          yPos,
          photoWidth,
          photoHeight,
          undefined,
          'FAST'
        );
      } catch (error) {
        console.error(`Erreur lors du chargement de la photo ${i}:`, error);
        // Dessiner un rectangle en cas d'erreur
        doc.setFillColor(240, 240, 240);
        doc.rect(xPos, yPos, photoWidth, photoHeight, 'F');
        doc.setFontSize(8);
        doc.text('Image non disponible', xPos + photoWidth/2, yPos + photoHeight/2, { align: 'center' });
      }
    }
    
    // Ajuster la position Y après les photos
    return yPos + photoHeight + 10;
  } catch (error) {
    console.error('Erreur lors de l\'ajout des photos:', error);
    return yPos;
  }
}

/**
 * Ajoute une signature au rapport
 */
export async function addSignature(doc: jsPDF, signature: string, yPos: number): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  
  // Vérifier s'il faut ajouter une nouvelle page
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = margin;
  }
  
  yPos = addSection(doc, 'Signature du technicien', yPos);
  
  try {
    // Charger la signature
    const signatureWidth = 100;
    const signatureHeight = 50;
    
    doc.addImage(
      signature,
      'PNG',
      pageWidth - margin - signatureWidth,
      yPos,
      signatureWidth,
      signatureHeight,
      undefined,
      'FAST'
    );
    
    yPos += signatureHeight + 10;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la signature:', error);
    yPos += 20;
  }
  
  return yPos;
}
