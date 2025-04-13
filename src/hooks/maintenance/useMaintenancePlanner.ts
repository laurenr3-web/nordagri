
import { useState, useCallback } from 'react';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { toast } from 'sonner';
import { 
  MaintenancePlan as TypesMaintenancePlan,
  MaintenanceStatus,
  MaintenancePriority,
  MaintenanceType
} from '@/types/models/maintenance';
import { 
  MaintenancePlan, 
  MaintenancePlanViewModel,
  dbToViewModel,
  viewModelToDB
} from './types/maintenancePlanTypes';

// Re-export types
export type { 
  MaintenanceFrequency, 
  MaintenanceUnit, 
  MaintenanceType, 
  MaintenancePriority, 
  MaintenanceStatus,
  MaintenancePlan,
  MaintenancePlanViewModel 
} from './types/maintenancePlanTypes';

export const useMaintenancePlanner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlanViewModel[]>([]);

  // Load maintenance plans
  const loadMaintenancePlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const plans = await maintenanceService.getMaintenancePlans();
      // Type cast the DB plans to the format expected by dbToViewModel
      const viewModels = plans.map((plan: any) => dbToViewModel(plan as MaintenancePlan));
      setMaintenancePlans(viewModels);
    } catch (error) {
      console.error('Error loading maintenance plans:', error);
      toast.error('Error loading maintenance plans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a maintenance plan
  const createMaintenancePlan = useCallback(async (plan: Omit<MaintenancePlanViewModel, "id">) => {
    setIsLoading(true);
    try {
      // Convert from ViewModel to DB model
      const dbPlan: any = {
        title: plan.title,
        description: plan.description,
        equipment_id: plan.equipmentId,
        equipment_name: plan.equipmentName,
        frequency: plan.frequency,
        interval: plan.interval,
        unit: plan.unit,
        next_due_date: plan.nextDueDate.toISOString(),
        last_performed_date: plan.lastPerformedDate ? plan.lastPerformedDate.toISOString() : undefined,
        type: plan.type,
        engine_hours: plan.engineHours,
        active: plan.active,
        priority: plan.priority,
        assigned_to: plan.assignedTo
      };
      
      const newPlan = await maintenanceService.addMaintenancePlan(dbPlan);
      // Type cast the DB response to the format expected by dbToViewModel
      const newViewModel = dbToViewModel(newPlan as MaintenancePlan);
      setMaintenancePlans(prev => [...prev, newViewModel]);
      toast.success('Maintenance plan created successfully');
      return newViewModel;
    } catch (error) {
      console.error('Error creating maintenance plan:', error);
      toast.error('Error creating maintenance plan');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a maintenance plan
  const updatePlan = useCallback(async (planId: number, updates: Partial<MaintenancePlanViewModel>) => {
    setIsLoading(true);
    try {
      // Convert updates from ViewModel to DB model format 
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.equipmentId !== undefined) dbUpdates.equipment_id = updates.equipmentId;
      if (updates.equipmentName !== undefined) dbUpdates.equipment_name = updates.equipmentName;
      if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
      if (updates.interval !== undefined) dbUpdates.interval = updates.interval;
      if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
      if (updates.nextDueDate !== undefined) dbUpdates.next_due_date = updates.nextDueDate.toISOString();
      if (updates.lastPerformedDate !== undefined) {
        dbUpdates.last_performed_date = updates.lastPerformedDate ? 
          updates.lastPerformedDate.toISOString() : undefined;
      }
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.engineHours !== undefined) dbUpdates.engine_hours = updates.engineHours;
      if (updates.active !== undefined) dbUpdates.active = updates.active;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
      
      const updated = await maintenanceService.updateMaintenancePlan(planId, dbUpdates);
      
      if (updated) {
        // Type cast the DB response to the format expected by dbToViewModel
        const updatedViewModel = dbToViewModel(updated as MaintenancePlan);
        setMaintenancePlans(prev => 
          prev.map(plan => plan.id === planId ? updatedViewModel : plan)
        );
      }
      toast.success('Maintenance plan updated successfully');
      return updated ? dbToViewModel(updated as MaintenancePlan) : null;
    } catch (error) {
      console.error('Error updating maintenance plan:', error);
      toast.error('Error updating maintenance plan');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a schedule from a maintenance plan
  const createScheduleFromPlan = useCallback(async (plan: MaintenancePlanViewModel, endDate: Date) => {
    setIsLoading(true);
    try {
      // Create a task directly from plan
      const dbPlan = viewModelToDB(plan);
      
      const task = {
        title: plan.title,
        notes: plan.description,
        equipment: plan.equipmentName,
        equipment_id: plan.equipmentId,
        due_date: plan.nextDueDate.toISOString(),
        status: 'pending' as MaintenanceStatus,
        priority: plan.priority,
        type: plan.type as MaintenanceType,
        assigned_to: plan.assignedTo
      };
      
      const newTask = await maintenanceService.addTask(task);
      toast.success(`New maintenance task scheduled`);
      return [newTask];
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
