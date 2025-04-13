
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMaintenancePlansService } from './services/maintenancePlansService';
import { generateSchedule } from './utils/maintenanceScheduler';
import { MaintenanceFormValues } from './maintenanceSlice';

// Fix re-exports using 'export type'
export type { MaintenancePlan } from './types/maintenancePlanTypes';
export type { MaintenanceFrequency } from './types/maintenancePlanTypes';
export type { MaintenanceUnit } from './types/maintenancePlanTypes';
export type { MaintenanceType } from './types/maintenancePlanTypes';

export const useMaintenancePlanner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>([]);
  const { toast } = useToast();
  
  // Use the extracted service for API calls
  const { fetchMaintenancePlans, addMaintenancePlan, updateMaintenancePlan } = useMaintenancePlansService();

  /**
   * Load maintenance plans from the database
   */
  const loadMaintenancePlans = async () => {
    setIsLoading(true);
    try {
      const plans = await fetchMaintenancePlans();
      setMaintenancePlans(plans);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les plans de maintenance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new maintenance plan
   */
  const createMaintenancePlan = async (plan: Omit<MaintenancePlan, 'id'>) => {
    try {
      const newPlan = await addMaintenancePlan(plan);
      if (newPlan) {
        setMaintenancePlans(prev => [...prev, newPlan]);
      }
      return newPlan;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le plan de maintenance",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Update an existing maintenance plan
   */
  const updatePlan = async (planId: number, updates: Partial<MaintenancePlan>) => {
    try {
      const updatedPlan = await updateMaintenancePlan(planId, updates);
      if (updatedPlan) {
        setMaintenancePlans(prev => 
          prev.map(plan => plan.id === planId ? { ...plan, ...updates } : plan)
        );
      }
      return updatedPlan;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le plan de maintenance",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Create a maintenance schedule from a plan
   */
  const createScheduleFromPlan = (plan: MaintenancePlan, endDate: Date) => {
    const tasks: MaintenanceFormValues[] = [];
    
    generateSchedule(plan, endDate, (task: MaintenanceFormValues) => {
      tasks.push(task);
    });
    
    return tasks;
  };

  return {
    isLoading,
    maintenancePlans,
    loadMaintenancePlans,
    createMaintenancePlan,
    updatePlan,
    createScheduleFromPlan,
  };
};
