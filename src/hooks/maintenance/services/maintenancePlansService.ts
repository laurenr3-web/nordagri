
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { MaintenancePlan as TypesMaintenancePlan } from '@/types/models/maintenance';
import { MaintenancePlan } from '../types/maintenancePlanTypes';

/**
 * Hook to interact with maintenance plans API
 */
export const useMaintenancePlansService = () => {
  /**
   * Fetch all maintenance plans
   */
  const fetchMaintenancePlans = async (): Promise<any[]> => {
    return await maintenanceService.getMaintenancePlans();
  };

  /**
   * Add a new maintenance plan
   */
  const addMaintenancePlan = async (plan: any): Promise<any> => {
    return await maintenanceService.addMaintenancePlan(plan);
  };

  /**
   * Update an existing maintenance plan
   */
  const updateMaintenancePlan = async (planId: number, updates: any): Promise<any> => {
    return await maintenanceService.updateMaintenancePlan(planId, updates);
  };

  return {
    fetchMaintenancePlans,
    addMaintenancePlan,
    updateMaintenancePlan
  };
};
