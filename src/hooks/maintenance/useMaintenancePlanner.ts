
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MaintenanceFormValues } from './maintenanceSlice';
import { MaintenancePlan, isMaintenanceFrequency, isMaintenanceUnit, isMaintenanceType } from './types/maintenancePlanTypes';
import { calculateNextDueDate, getFormattedNextDueDate } from './utils/maintenanceDateUtils';
import { generateSchedule } from './utils/maintenanceScheduler';
import { useMaintenancePlansService } from './services/maintenancePlansService';

// Re-export the types from maintenancePlanTypes.ts for backward compatibility
export { 
  MaintenanceFrequency, 
  MaintenanceUnit, 
  MaintenanceType, 
  MaintenancePlan,
  isMaintenanceFrequency,
  isMaintenanceUnit,
  isMaintenanceType
} from './types/maintenancePlanTypes';

// Re-export MaintenancePriority for backward compatibility
export type { MaintenancePriority } from './maintenanceSlice';

export const useMaintenancePlanner = () => {
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Use our extracted service
  const plansService = useMaintenancePlansService();

  const fetchMaintenancePlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const plans = await plansService.fetchMaintenancePlans();
      setMaintenancePlans(plans);
    } catch (err: any) {
      console.error('Error in fetchMaintenancePlans:', err);
      setError(err.message || "Erreur lors de la récupération des plans de maintenance");
    } finally {
      setLoading(false);
    }
  }, [plansService]);

  useEffect(() => {
    fetchMaintenancePlans();
  }, [fetchMaintenancePlans]);

  // Alias for createMaintenancePlan to match the method name used in the dialog
  const createMaintenancePlan = async (plan: Omit<MaintenancePlan, 'id'>): Promise<MaintenancePlan | null> => {
    return addMaintenancePlan(plan);
  };

  const addMaintenancePlan = async (plan: Omit<MaintenancePlan, 'id'>): Promise<MaintenancePlan | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Ajouter le plan de maintenance via le service
      const newPlan = await plansService.addMaintenancePlan(plan);
      
      if (newPlan) {
        // Mettre à jour l'état local
        setMaintenancePlans(prevPlans => [...prevPlans, newPlan]);
        
        // Invalider le cache pour rafraîchir les données
        queryClient.invalidateQueries({ queryKey: ['maintenancePlans'] });
      }
      
      return newPlan;
    } catch (err: any) {
      console.error('Error in addMaintenancePlan:', err);
      setError(err.message || "Erreur lors de l'ajout du plan de maintenance");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMaintenancePlan = async (planId: number, updates: Partial<MaintenancePlan>): Promise<MaintenancePlan | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Mettre à jour le plan de maintenance via le service
      const updatedPlan = await plansService.updateMaintenancePlan(planId, updates);
      
      if (updatedPlan) {
        // Mettre à jour l'état local
        setMaintenancePlans(prevPlans =>
          prevPlans.map(plan => plan.id === planId ? updatedPlan : plan)
        );
        
        // Invalider le cache pour rafraîchir les données
        queryClient.invalidateQueries({ queryKey: ['maintenancePlans'] });
      }
      
      return updatedPlan;
    } catch (err: any) {
      console.error('Error in updateMaintenancePlan:', err);
      setError(err.message || "Erreur lors de la mise à jour du plan de maintenance");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    maintenancePlans,
    loading,
    error,
    fetchMaintenancePlans,
    addMaintenancePlan,
    createMaintenancePlan, // Added this alias
    updateMaintenancePlan,
    calculateNextDueDate,
    generateSchedule,
    getFormattedNextDueDate
  };
};
