
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Intervention } from '@/types/Intervention';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { equipmentPhotoService } from '@/services/supabase/equipmentPhotoService';
import { saveAs } from 'file-saver';

// Déclaration pour étendre jsPDF avec autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
    internal: {
      getNumberOfPages: () => number;
      pageSize: {
        getWidth: () => number;
        getHeight: () => number;
      };
    };
  }
}

interface InterventionReportOptions {
  farmName?: string;
  farmLogo?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  includeSignature?: boolean;
  includePhotos?: boolean;
  includeParts?: boolean;
  includeContact?: boolean;
}

/**
 * Service pour générer des rapports d'intervention PDF professionnels
 */
export const interventionReportService = {
  /**
   * Génère un rapport d'intervention en PDF
   */
  async generateReport(
    intervention: Intervention,
    signature?: string,
    photos?: string[],
    options: InterventionReportOptions = {}
  ): Promise<Blob> {
    try {
      const doc = new jsPDF();
      
      // Définir les marges et les dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;
      
      // Ajouter l'en-tête
      yPos = await this.addHeader(doc, options, yPos);
      
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
      doc.text(`Statut: ${this.translateStatus(intervention.status)}`, margin, yPos);
      doc.text(`Priorité: ${this.translatePriority(intervention.priority)}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 10;
      
      // Section Équipement
      yPos = this.addSection(doc, 'Informations sur l\'Équipement', yPos);
      
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
      yPos = this.addSection(doc, 'Description du Problème', yPos);
      
      const splitDescription = doc.splitTextToSize(
        intervention.description || 'Aucune description fournie',
        pageWidth - (margin * 2)
      );
      
      doc.setFontSize(10);
      doc.text(splitDescription, margin, yPos);
      yPos += splitDescription.length * 5 + 10;
      
      // Section Travaux Effectués
      if (intervention.status === 'completed' && intervention.notes) {
        yPos = this.addSection(doc, 'Travaux Effectués', yPos);
        
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
        yPos = this.addSection(doc, 'Pièces Utilisées', yPos);
        
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
        yPos = await this.addPhotos(doc, photos, yPos);
      }
      
      // Ajouter la signature
      if (options.includeSignature && signature) {
        yPos = await this.addSignature(doc, signature, yPos);
      }
      
      // Ajouter le pied de page
      this.addFooter(doc, options);
      
      // Retourner le PDF sous forme de Blob
      return doc.output('blob');
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      throw error;
    }
  },
  
  /**
   * Ajoute l'en-tête au document
   */
  async addHeader(doc: jsPDF, options: InterventionReportOptions, yPos: number): Promise<number> {
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
  },
  
  /**
   * Ajoute une section au rapport
   */
  addSection(doc: jsPDF, title: string, yPos: number): number {
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
  },
  
  /**
   * Ajoute des photos au rapport
   */
  async addPhotos(doc: jsPDF, photos: string[], yPos: number): Promise<number> {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    
    // Ajouter une section pour les photos
    yPos = this.addSection(doc, 'Photos d\'Intervention', yPos);
    
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
  },
  
  /**
   * Ajoute une signature au rapport
   */
  async addSignature(doc: jsPDF, signature: string, yPos: number): Promise<number> {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    
    // Vérifier s'il faut ajouter une nouvelle page
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }
    
    yPos = this.addSection(doc, 'Signature du technicien', yPos);
    
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
  },
  
  /**
   * Ajoute le pied de page au document
   */
  addFooter(doc: jsPDF, options: InterventionReportOptions): void {
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
  },
  
  /**
   * Traduit le statut en français
   */
  translateStatus(status: string): string {
    switch (status) {
      case 'scheduled': return 'Planifiée';
      case 'in-progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'canceled': return 'Annulée';
      default: return status;
    }
  },
  
  /**
   * Traduit la priorité en français
   */
  translatePriority(priority: string): string {
    switch (priority) {
      case 'low': return 'Basse';
      case 'medium': return 'Moyenne';
      case 'high': return 'Haute';
      default: return priority;
    }
  },
  
  /**
   * Télécharge le rapport d'intervention
   */
  async downloadReport(
    intervention: Intervention,
    signature?: string,
    photos?: string[],
    options: InterventionReportOptions = {}
  ): Promise<void> {
    try {
      const blob = await this.generateReport(intervention, signature, photos, options);
      const fileName = `intervention_${intervention.id}_${format(new Date(), 'yyyyMMdd')}.pdf`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Erreur lors du téléchargement du rapport:', error);
      throw error;
    }
  },
  
  /**
   * Envoie le rapport par email
   */
  async sendReportByEmail(
    intervention: Intervention,
    emailTo: string,
    subject: string,
    message: string,
    signature?: string,
    photos?: string[],
    options: InterventionReportOptions = {}
  ): Promise<boolean> {
    try {
      // Générer le rapport
      const blob = await this.generateReport(intervention, signature, photos, options);
      
      // Convertir le blob en base64
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          const base64data = reader.result?.toString().split(',')[1];
          
          if (!base64data) {
            reject(new Error('Erreur lors de la conversion du PDF'));
            return;
          }
          
          try {
            // Appeler la fonction Supabase Edge pour envoyer l'email
            const fileName = `intervention_${intervention.id}_${format(new Date(), 'yyyyMMdd')}.pdf`;
            
            const { error } = await supabase.functions.invoke('send-intervention-report', {
              body: {
                to: emailTo,
                subject: subject || `Rapport d'intervention #${intervention.id} - ${intervention.title}`,
                message: message || `Veuillez trouver ci-joint le rapport d'intervention concernant ${intervention.equipment}.`,
                pdfBase64: base64data,
                fileName,
                interventionId: intervention.id
              }
            });
            
            if (error) throw error;
            
            resolve(true);
          } catch (error) {
            console.error('Erreur lors de l\'envoi du rapport par email:', error);
            reject(error);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Erreur lors de la lecture du PDF'));
        };
        
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rapport par email:', error);
      return false;
    }
  }
};
