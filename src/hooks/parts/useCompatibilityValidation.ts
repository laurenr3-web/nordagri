
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNetworkState } from '@/hooks/useNetworkState';

interface UseCompatibilityValidationOptions {
  onValidationError?: (invalidIds: number[]) => void;
}

export function useCompatibilityValidation({
  onValidationError
}: UseCompatibilityValidationOptions = {}) {
  const [invalidIds, setInvalidIds] = useState<number[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  const isOnline = useNetworkState();

  // Fonction pour valider les IDs des équipements
  const validateCompatibility = useCallback(async (equipmentIds: number[]): Promise<boolean> => {
    // Si aucun ID à valider, c'est valide
    if (!equipmentIds || equipmentIds.length === 0) {
      return true;
    }

    // Si l'utilisateur est hors-ligne, on considère que c'est valide
    // et on le synchronisera plus tard
    if (!isOnline) {
      toast({
        title: "Mode hors-ligne",
        description: "La validation des équipements sera effectuée lors de la connexion.",
      });
      return true;
    }

    try {
      setIsValidating(true);
      
      // Récupérer tous les IDs valides depuis Supabase
      const { data, error } = await supabase
        .from('equipment')
        .select('id')
        .in('id', equipmentIds);
      
      if (error) throw error;
      
      // Vérifier les IDs qui sont manquants
      const validIds = new Set(data.map((item: any) => item.id));
      const invalidEquipmentIds = equipmentIds.filter(id => !validIds.has(id));
      
      setInvalidIds(invalidEquipmentIds);
      
      if (invalidEquipmentIds.length > 0) {
        toast({
          variant: "destructive",
          title: "Équipements incompatibles",
          description: `${invalidEquipmentIds.length} équipement(s) sélectionné(s) n'existe(nt) plus.`,
        });
        
        if (onValidationError) {
          onValidationError(invalidEquipmentIds);
        }
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la validation des équipements compatibles:", error);
      
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: "Impossible de vérifier les équipements. Veuillez réessayer.",
      });
      
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [isOnline, toast, onValidationError]);

  // Fonction de nettoyage des IDs invalides
  const cleanInvalidIds = useCallback((equipmentIds: number[]): number[] => {
    if (!invalidIds.length) return equipmentIds;
    return equipmentIds.filter(id => !invalidIds.includes(id));
  }, [invalidIds]);

  return {
    validateCompatibility,
    cleanInvalidIds,
    isValidating,
    invalidIds
  };
}

// Hook pour gérer l'état de la connexion réseau
export function useNetworkState() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
