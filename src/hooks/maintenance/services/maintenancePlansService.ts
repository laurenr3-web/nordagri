
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { MaintenancePlan } from '../types/maintenancePlanTypes';

/**
 * Hook to interact with maintenance plans API
 */
export const useMaintenancePlansService = () => {
  /**
   * Fetch all maintenance plans
   */
  const fetchMaintenancePlans = async (): Promise<MaintenancePlan[]> => {
    return await maintenanceService.getMaintenancePlans();
  };

  /**
   * Add a new maintenance plan
   */
  const addMaintenancePlan = async (plan: Omit<MaintenancePlan, 'id'>): Promise<MaintenancePlan> => {
    return await maintenanceService.addMaintenancePlan(plan);
  };

  /**
   * Update an existing maintenance plan
   */
  const updateMaintenancePlan = async (planId: number, updates: Partial<MaintenancePlan>): Promise<MaintenancePlan | null> => {
    return await maintenanceService.updateMaintenancePlan(planId, updates);
  };

  return {
    fetchMaintenancePlans,
    addMaintenancePlan,
    updateMaintenancePlan
  };
};
