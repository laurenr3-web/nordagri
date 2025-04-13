
import { useState, useCallback } from 'react';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { toast } from 'sonner';
import { adaptServiceTaskToModelTask } from './adapters/maintenanceTypeAdapters';

export type { MaintenanceFrequency, MaintenanceUnit, MaintenanceType, MaintenancePriority, MaintenanceStatus } from './types/maintenancePlanTypes';
export type { MaintenancePlan } from './types/maintenancePlanTypes';

export const useMaintenancePlanner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>([]);

  // Load maintenance plans
  const loadMaintenancePlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const plans = await maintenanceService.getMaintenancePlans();
      setMaintenancePlans(plans);
    } catch (error) {
      console.error('Error loading maintenance plans:', error);
      toast.error('Error loading maintenance plans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a maintenance plan
  const createMaintenancePlan = useCallback(async (plan: Omit<MaintenancePlan, "id">) => {
    setIsLoading(true);
    try {
      const newPlan = await maintenanceService.addMaintenancePlan(plan);
      setMaintenancePlans(prev => [...prev, newPlan]);
      toast.success('Maintenance plan created successfully');
      return newPlan;
    } catch (error) {
      console.error('Error creating maintenance plan:', error);
      toast.error('Error creating maintenance plan');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a maintenance plan
  const updatePlan = useCallback(async (planId: number, updates: MaintenancePlan) => {
    setIsLoading(true);
    try {
      const updated = await maintenanceService.updateMaintenancePlan(planId, updates);
      setMaintenancePlans(prev => 
        prev.map(plan => plan.id === planId ? updated : plan)
      );
      toast.success('Maintenance plan updated successfully');
      return updated;
    } catch (error) {
      console.error('Error updating maintenance plan:', error);
      toast.error('Error updating maintenance plan');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a schedule from a maintenance plan
  const createScheduleFromPlan = useCallback(async (plan: MaintenancePlan, endDate: Date) => {
    setIsLoading(true);
    try {
      const tasks = await maintenanceService.generateTasksFromPlan(plan.id, endDate);
      toast.success(`${tasks.length} maintenance tasks scheduled`);
      return tasks;
    } catch (error) {
      console.error('Error creating schedule from plan:', error);
      toast.error('Error creating maintenance schedule');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    maintenancePlans,
    loadMaintenancePlans,
    createMaintenancePlan,
    updatePlan,
    createScheduleFromPlan
  };
};
