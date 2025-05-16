
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Intervention } from '@/types/Intervention';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { saveAs } from 'file-saver';
import { InterventionReportOptions } from './types/interventionReportTypes';
import { generateReport } from './generators/pdfGenerator';

/**
 * Service pour générer des rapports d'intervention PDF professionnels
 */
export const interventionReportService = {
  /**
   * Génère un rapport d'intervention en PDF
   */
  generateReport,
  
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
