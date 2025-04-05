
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
   * @returns Un hash unique pour le QR code
   */
  generateUniqueHash(): string {
    // Générer un UUID et le convertir en chaîne courte sans tirets
    return uuidv4().replace(/-/g, '').substring(0, 16);
  },
  
  /**
   * Crée un nouveau QR code pour un équipement
   * @param equipmentId ID de l'équipement
   * @returns Le QR code créé ou existant
   * @throws Erreur si la création échoue
   */
  async createQRCode(equipmentId: number): Promise<EquipmentQRCode> {
    try {
      if (!equipmentId || isNaN(equipmentId) || equipmentId <= 0) {
        throw new Error("ID d'équipement invalide");
      }
      
      // Vérifier si un QR code actif existe déjà pour cet équipement
      const { data: existingQRCode, error: fetchError } = await supabase
        .from('equipment_qrcodes')
        .select('*')
        .eq('equipment_id', equipmentId)
        .eq('active', true)
        .maybeSingle();
        
      // Si un QR code actif existe, le retourner
      if (existingQRCode && !fetchError) {
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
      
      if (!data) {
        throw new Error("Échec de création du QR code: aucune donnée retournée");
      }
      
      return data as EquipmentQRCode;
    } catch (error: any) {
      console.error('Erreur lors de la création du QR code:', error);
      throw error;
    }
  },
  
  /**
   * Récupère le QR code actif pour un équipement
   * @param equipmentId ID de l'équipement
   * @returns Le QR code actif ou null si aucun n'existe
   * @throws Erreur si la récupération échoue
   */
  async getQRCodeForEquipment(equipmentId: number): Promise<EquipmentQRCode | null> {
    try {
      if (!equipmentId || isNaN(equipmentId) || equipmentId <= 0) {
        throw new Error("ID d'équipement invalide");
      }
      
      const { data, error } = await supabase
        .from('equipment_qrcodes')
        .select('*')
        .eq('equipment_id', equipmentId)
        .eq('active', true)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data as EquipmentQRCode | null;
    } catch (error: any) {
      console.error('Erreur lors de la récupération du QR code:', error);
      throw error;
    }
  },
  
  /**
   * Récupère un équipement par son hash de QR code
   * @param hash Hash du QR code
   * @returns L'ID de l'équipement et l'ID du QR code, ou null si le QR code n'existe pas
   * @throws Erreur si la récupération échoue
   */
  async getEquipmentByQRCodeHash(hash: string): Promise<{equipment_id: number; id: string} | null> {
    try {
      if (!hash || typeof hash !== 'string' || hash.length < 8) {
        throw new Error("Hash de QR code invalide");
      }
      
      const { data, error } = await supabase
        .from('equipment_qrcodes')
        .select('id, equipment_id')
        .eq('qr_code_hash', hash)
        .eq('active', true)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (!data) {
        return null;
      }
      
      // Mettre à jour la date du dernier scan
      await this.updateLastScanned(data.id).catch(err => {
        // Log l'erreur mais ne l'expose pas à l'appelant car ce n'est pas critique
        console.warn('Échec de mise à jour de la date de scan:', err);
      });
      
      return data as {equipment_id: number; id: string};
    } catch (error: any) {
      console.error('Erreur lors de la recherche du QR code:', error);
      throw error;
    }
  },
  
  /**
   * Met à jour la date du dernier scan
   * @param qrCodeId ID du QR code
   * @throws Erreur si la mise à jour échoue
   */
  async updateLastScanned(qrCodeId: string): Promise<void> {
    try {
      if (!qrCodeId) {
        throw new Error("ID de QR code invalide");
      }
      
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
   * @param equipmentId ID de l'équipement
   * @returns Le nouveau QR code
   * @throws Erreur si la régénération échoue
   */
  async regenerateQRCode(equipmentId: number): Promise<EquipmentQRCode> {
    try {
      if (!equipmentId || isNaN(equipmentId) || equipmentId <= 0) {
        throw new Error("ID d'équipement invalide");
      }
      
      // Désactiver les QR codes existants
      const { error } = await supabase
        .from('equipment_qrcodes')
        .update({ active: false })
        .eq('equipment_id', equipmentId);
      
      if (error) throw error;
      
      // Créer un nouveau QR code
      return this.createQRCode(equipmentId);
    } catch (error: any) {
      console.error('Erreur lors de la régénération du QR code:', error);
      throw error;
    }
  },
  
  /**
   * Vérifie si un QR code est valide et actif
   * @param hash Hash du QR code
   * @returns true si le QR code est valide, false sinon
   */
  async isValidQRCode(hash: string): Promise<boolean> {
    try {
      if (!hash || typeof hash !== 'string') {
        return false;
      }
      
      const result = await this.getEquipmentByQRCodeHash(hash);
      return result !== null;
    } catch (error) {
      console.error('Erreur lors de la validation du QR code:', error);
      return false;
    }
  }
};
