
import { useEquipmentRealtime } from './equipment/useEquipmentRealtime';
import { usePartsRealtime } from './parts/usePartsRealtime';
import { useMaintenanceRealtime } from './maintenance/useMaintenanceRealtime';
import { useInterventionsRealtime } from './interventions/useInterventionsRealtime';

/**
 * Hook to manage all realtime subscriptions in the application
 * @returns Status of all subscriptions
 */
export function useSupabaseRealtime() {
  const equipment = useEquipmentRealtime();
  const parts = usePartsRealtime();
  const maintenance = useMaintenanceRealtime();
  const interventions = useInterventionsRealtime();
  
  return {
    equipment,
    parts,
    maintenance,
    interventions,
    allSubscribed: 
      equipment.isSubscribed && 
      parts.isSubscribed && 
      maintenance.isSubscribed &&
      interventions.isSubscribed
  };
}
