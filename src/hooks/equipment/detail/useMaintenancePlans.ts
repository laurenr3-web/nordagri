
import { useState, useEffect } from 'react';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { MaintenancePlan } from '@/hooks/maintenance/types/maintenancePlanTypes';
import { toast } from 'sonner';

export const useMaintenancePlans = (equipmentId: string | undefined) => {
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchPlans = async () => {
      if (!equipmentId) return;
      
      try {
        setLoading(true);
        const numericId = parseInt(equipmentId, 10);
        
        // Call the service to get maintenance plans for this equipment
        const equipmentPlans = await maintenanceService.getMaintenancePlansForEquipment(numericId);
        setPlans(equipmentPlans);
      } catch (err: any) {
        console.error('Error fetching maintenance plans:', err);
        setError(err instanceof Error ? err : new Error(err.message));
        toast.error('Erreur lors du chargement des plans de maintenance');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, [equipmentId]);
  
  return {
    plans,
    loading,
    error
  };
};
