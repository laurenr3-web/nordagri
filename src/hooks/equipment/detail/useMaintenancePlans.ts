
import { useState, useEffect, useCallback } from 'react';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { MaintenancePlan } from '@/hooks/maintenance/useMaintenancePlanner';
import { useQueryClient } from '@tanstack/react-query';

export function useMaintenancePlans(id: string | undefined, equipment: any | null) {
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const fetchMaintenancePlans = useCallback(async () => {
    if (!id || !equipment) {
      console.log('No ID or equipment provided for maintenance plans');
      setLoading(false);
      return;
    }
    
    try {
      console.log(`Fetching maintenance plans for equipment ID ${id} (${equipment.name})`);
      setLoading(true);
      setError(null);
      
      // Récupérer les plans de maintenance pour cet équipement
      const plans = await maintenanceService.getMaintenancePlansForEquipment(Number(id));
      
      console.log('Maintenance plans for this equipment:', plans);
      setMaintenancePlans(plans);
    } catch (err: any) {
      console.error('Error fetching maintenance plans:', err);
      setError(err.message || "Erreur lors de la récupération des plans de maintenance");
      // Ne pas bloquer le chargement de l'équipement si les plans ne sont pas disponibles
      setMaintenancePlans([]);
    } finally {
      setLoading(false);
    }
  }, [id, equipment]);
  
  useEffect(() => {
    fetchMaintenancePlans();
  }, [fetchMaintenancePlans]);

  const refresh = useCallback(() => {
    console.log('Refreshing maintenance plans...');
    setLoading(true);
    // Invalider le cache pour forcer un rechargement des données
    queryClient.invalidateQueries({ queryKey: ['maintenancePlans'] });
    fetchMaintenancePlans();
  }, [fetchMaintenancePlans, queryClient]);

  return { maintenancePlans, loading, error, refresh };
}
