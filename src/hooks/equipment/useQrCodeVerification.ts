
import { useState } from 'react';
import { qrCodeService } from '@/services/supabase/qrCodeService';
import { equipmentService } from '@/services/supabase/equipmentService';
import { toast } from 'sonner';

interface QrCodeVerificationResult {
  isValid: boolean;
  equipmentId: number | null;
  isLoading: boolean;
  error: string | null;
  verifyQrCode: (hash: string) => Promise<{
    isValid: boolean;
    equipmentId: number | null;
  }>;
}

/**
 * Hook pour gérer la vérification des QR codes d'équipement
 */
export function useQrCodeVerification(): QrCodeVerificationResult {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [equipmentId, setEquipmentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Vérifie la validité d'un QR code et récupère l'ID de l'équipement associé
   * @param hash Hash du QR code à vérifier
   * @returns Objet contenant le statut de validité et l'ID d'équipement (si valide)
   */
  const verifyQrCode = async (hash: string): Promise<{
    isValid: boolean;
    equipmentId: number | null;
  }> => {
    // Réinitialiser l'état
    setIsLoading(true);
    setError(null);
    
    try {
      // Étape 1: Vérifier si le QR code existe dans la base de données
      const equipmentQrCode = await qrCodeService.getEquipmentByQRCodeHash(hash);
      
      if (!equipmentQrCode) {
        setIsValid(false);
        setEquipmentId(null);
        setError("QR code invalide ou expiré");
        return { isValid: false, equipmentId: null };
      }
      
      // Étape 2: Vérifier si l'ID d'équipement est valide
      const id = equipmentQrCode.equipment_id;
      if (isNaN(id) || id <= 0) {
        setIsValid(false);
        setEquipmentId(null);
        setError("ID d'équipement invalide associé à ce QR code");
        return { isValid: false, equipmentId: null };
      }
      
      // Étape 3: Vérifier si l'équipement existe toujours
      const equipment = await equipmentService.getEquipmentById(id);
      
      if (!equipment) {
        setIsValid(false);
        setEquipmentId(null);
        setError("L'équipement associé à ce QR code n'existe plus");
        return { isValid: false, equipmentId: null };
      }
      
      // QR code valide et équipement trouvé
      setIsValid(true);
      setEquipmentId(id);
      setError(null);
      return { isValid: true, equipmentId: id };
      
    } catch (err: any) {
      console.error('Erreur lors de la vérification du QR code:', err);
      setIsValid(false);
      setEquipmentId(null);
      setError(err.message || "Une erreur s'est produite lors de la vérification du QR code");
      return { isValid: false, equipmentId: null };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isValid,
    equipmentId,
    isLoading,
    error,
    verifyQrCode
  };
}
