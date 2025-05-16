
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { Intervention } from '@/types/Intervention';
import { InterventionReportOptions } from './types/interventionReportTypes';
import { supabase } from '@/integrations/supabase/client';
import { generateReport } from './generators/pdfGenerator';

class InterventionReportService {
  /**
   * Génère un rapport d'intervention en PDF
   */
  async generateReport(
    intervention: Intervention,
    signature?: string,
    photos?: string[],
    options: InterventionReportOptions = {}
  ): Promise<Blob> {
    return await generateReport(intervention, signature, photos, options);
  }
  
  /**
   * Télécharge un rapport d'intervention en PDF
   */
  async downloadReport(
    intervention: Intervention,
    signature?: string,
    photos?: string[],
    options: InterventionReportOptions = {}
  ): Promise<void> {
    try {
      const pdfBlob = await this.generateReport(intervention, signature, photos, options);
      const fileName = `intervention_${intervention.id}_${format(new Date(intervention.date), 'yyyyMMdd')}.pdf`;
      
      saveAs(pdfBlob, fileName);
    } catch (error) {
      console.error('Erreur lors du téléchargement du rapport PDF:', error);
      throw error;
    }
  }
  
  /**
   * Convertit un Blob en base64
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Extraire uniquement la partie base64 du résultat (après "base64,")
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Impossible de convertir le PDF en base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  /**
   * Envoie un rapport d'intervention par email
   */
  async sendReportByEmail(
    intervention: Intervention,
    to: string,
    subject?: string,
    message?: string,
    signature?: string,
    photos?: string[],
    options: InterventionReportOptions = {}
  ): Promise<boolean> {
    try {
      if (!to) {
        throw new Error('Adresse email du destinataire requise');
      }
      
      // Générer le PDF
      const pdfBlob = await this.generateReport(intervention, signature, photos, options);
      const pdfBase64 = await this.blobToBase64(pdfBlob);
      
      // Préparer le nom de fichier
      const fileName = `intervention_${intervention.id}_${format(new Date(intervention.date), 'yyyyMMdd')}.pdf`;
      
      // Préparer le sujet et le message par défaut si non fournis
      const emailSubject = subject || `Rapport d'intervention #${intervention.id} - ${intervention.title}`;
      const emailMessage = message || `Veuillez trouver ci-joint le rapport d'intervention pour l'équipement "${intervention.equipment}".`;
      
      // Envoyer l'email via Supabase Function
      const { error } = await supabase.functions.invoke('send-intervention-report', {
        body: {
          to,
          subject: emailSubject,
          message: emailMessage,
          pdfBase64,
          fileName,
          interventionId: intervention.id
        }
      });
      
      if (error) {
        console.error('Erreur Supabase lors de l\'envoi de l\'email:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rapport par email:', error);
      return false;
    }
  }
}

export const interventionReportService = new InterventionReportService();
