
import { useState, useEffect } from 'react';
import { useEquipmentRealtime } from './equipment/useEquipmentRealtime';
import { usePartsRealtime } from './parts/usePartsRealtime';
import { useMaintenanceRealtime } from './maintenance/useMaintenanceRealtime';
import { useInterventionsRealtime } from './interventions/useInterventionsRealtime';
import { useToast } from './use-toast';

/**
 * Hook optimisé pour gérer toutes les souscriptions en temps réel dans l'application
 * avec une meilleure gestion des performances
 */
export function useSupabaseRealtime() {
  const equipment = useEquipmentRealtime();
  const parts = usePartsRealtime();
  const maintenance = useMaintenanceRealtime();
  const interventions = useInterventionsRealtime();
  const { toast } = useToast();
  const [hasShownToast, setHasShownToast] = useState(false);
  
  // Calculer l'état global des souscriptions
  const allSubscribed = 
    equipment.isSubscribed && 
    parts.isSubscribed && 
    maintenance.isSubscribed &&
    interventions.isSubscribed;
  
  const hasError = 
    equipment.error || 
    parts.error || 
    maintenance.error ||
    interventions.error;
    
  // Afficher un toast uniquement lorsque l'état change pour éviter les notifications répétées
  useEffect(() => {
    // Ne montrer la notification de succès qu'une seule fois
    if (allSubscribed && !hasShownToast) {
      console.log('✅ Toutes les souscriptions en temps réel sont actives');
      toast({
        title: 'Synchronisation active',
        description: 'Toutes les données sont synchronisées en temps réel',
      });
      setHasShownToast(true);
    }
    
    // Notifier en cas d'erreur de synchronisation
    if (hasError) {
      console.error('❌ Problèmes avec les souscriptions en temps réel:', {
        equipment: equipment.error,
        parts: parts.error,
        maintenance: maintenance.error,
        interventions: interventions.error
      });
    }
  }, [allSubscribed, hasError, toast, hasShownToast, 
      equipment.error, parts.error, maintenance.error, interventions.error]);
  
  return {
    equipment,
    parts,
    maintenance,
    interventions,
    allSubscribed,
    hasError
  };
}
