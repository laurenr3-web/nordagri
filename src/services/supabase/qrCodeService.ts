
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface EquipmentQRCode {
  id: string;
  equipment_id: number;
  qr_code_hash: string;
  created_at: string;
  last_scanned?: string;
  active: boolean;
}

/**
 * Service pour gérer les QR codes des équipements
 */
export const qrCodeService = {
  /**
   * Génère un hash unique pour un QR code
   */
  generateUniqueHash(): string {
    // Générer un UUID et le convertir en chaîne courte sans tirets
    return uuidv4().replace(/-/g, '').substring(0, 16);
  },
  
  /**
   * Crée un nouveau QR code pour un équipement
   */
  async createQRCode(equipmentId: number): Promise<EquipmentQRCode> {
    try {
      // Vérifier si un QR code actif existe déjà pour cet équipement
      const { data: existingQRCode, error: fetchError } = await supabase
        .from('equipment_qrcodes')
        .select('*')
        .eq('equipment_id', equipmentId)
        .eq('active', true)
        .single();
        
      // Si un QR code actif existe, le retourner
      if (existingQRCode && !fetchError) {
        console.log('QR code existant trouvé:', existingQRCode);
        return existingQRCode as EquipmentQRCode;
      }
      
      // Si une erreur autre que "no rows returned" est survenue
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      // Générer un nouveau hash unique
      const qrCodeHash = this.generateUniqueHash();
      
      // Insérer le nouveau QR code dans la base de données
      const { data, error } = await supabase
        .from('equipment_qrcodes')
        .insert({
          equipment_id: equipmentId,
          qr_code_hash: qrCodeHash,
          active: true
        })
        .select()
        .single();
        
      if (error) throw error;
      
      console.log('Nouveau QR code créé:', data);
      return data as EquipmentQRCode;
    } catch (error: any) {
      console.error('Erreur lors de la création du QR code:', error);
      throw error;
    }
  },
  
  /**
   * Récupère le QR code actif pour un équipement
   */
  async getQRCodeForEquipment(equipmentId: number): Promise<EquipmentQRCode | null> {
    try {
      const { data, error } = await supabase
        .from('equipment_qrcodes')
        .select('*')
        .eq('equipment_id', equipmentId)
        .eq('active', true)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // Aucun QR code trouvé
          return null;
        }
        throw error;
      }
      
      return data as EquipmentQRCode;
    } catch (error: any) {
      console.error('Erreur lors de la récupération du QR code:', error);
      throw error;
    }
  },
  
  /**
   * Récupère un équipement par son hash de QR code
   */
  async getEquipmentByQRCodeHash(hash: string): Promise<{equipment_id: number; id: string} | null> {
    try {
      const { data, error } = await supabase
        .from('equipment_qrcodes')
        .select('id, equipment_id')
        .eq('qr_code_hash', hash)
        .eq('active', true)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // QR code non trouvé
          return null;
        }
        throw error;
      }
      
      // Mettre à jour la date du dernier scan
      await this.updateLastScanned(data.id);
      
      return data as {equipment_id: number; id: string};
    } catch (error: any) {
      console.error('Erreur lors de la recherche du QR code:', error);
      throw error;
    }
  },
  
  /**
   * Met à jour la date du dernier scan
   */
  async updateLastScanned(qrCodeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('equipment_qrcodes')
        .update({
          last_scanned: new Date().toISOString()
        })
        .eq('id', qrCodeId);
        
      if (error) throw error;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la date de scan:', error);
      throw error;
    }
  },
  
  /**
   * Régénère un QR code pour un équipement (désactive l'ancien et en crée un nouveau)
   */
  async regenerateQRCode(equipmentId: number): Promise<EquipmentQRCode> {
    try {
      // Désactiver les QR codes existants
      await supabase
        .from('equipment_qrcodes')
        .update({ active: false })
        .eq('equipment_id', equipmentId);
      
      // Créer un nouveau QR code
      return this.createQRCode(equipmentId);
    } catch (error: any) {
      console.error('Erreur lors de la régénération du QR code:', error);
      throw error;
    }
  }
};
