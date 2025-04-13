
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { MaintenancePlan, MaintenanceFrequency, MaintenanceType, MaintenanceUnit, MaintenancePriority } from './types/maintenancePlanTypes';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

export { MaintenanceFrequency, MaintenanceType, MaintenanceUnit, MaintenancePriority, MaintenancePlan };

export const useMaintenancePlanner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>([]);

  // Load maintenance plans from the database
  const loadMaintenancePlans = async () => {
    try {
      setIsLoading(true);
      const plans = await maintenanceService.getMaintenancePlans();
      setMaintenancePlans(plans);
      return plans;
    } catch (error) {
      console.error('Error loading maintenance plans:', error);
      toast.error('Erreur lors du chargement des plans de maintenance');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Load plans on component mount
  useEffect(() => {
    loadMaintenancePlans();
  }, []);

  // Create a new maintenance plan
  const createMaintenancePlan = async (plan: Omit<MaintenancePlan, "id">) => {
    try {
      setIsLoading(true);
      const newPlan = await maintenanceService.addMaintenancePlan(plan);
      
      // Update local state
      setMaintenancePlans(prev => [...prev, newPlan]);
      
      return newPlan;
    } catch (error) {
      console.error('Error creating maintenance plan:', error);
      toast.error('Erreur lors de la création du plan de maintenance');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing plan
  const updatePlan = async (planId: number, updates: MaintenancePlan) => {
    try {
      setIsLoading(true);
      const updatedPlan = await maintenanceService.updateMaintenancePlan(planId, updates);
      
      // Update local state
      if (updatedPlan) {
        setMaintenancePlans(prev => 
          prev.map(p => p.id === planId ? updatedPlan : p)
        );
      }
      
      return updatedPlan;
    } catch (error) {
      console.error(`Error updating plan ${planId}:`, error);
      toast.error('Erreur lors de la mise à jour du plan');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a maintenance schedule up to a specific end date based on a plan
  const createScheduleFromPlan = async (plan: MaintenancePlan, endDate: Date) => {
    try {
      setIsLoading(true);
      
      const tasks = [];
      let currentDate = new Date(plan.nextDueDate);
      
      while (currentDate <= endDate) {
        // Create a task for this date
        const task = {
          title: plan.title,
          equipment: plan.equipmentName,
          equipment_id: plan.equipmentId,
          due_date: currentDate.toISOString(),
          status: 'pending',
          priority: plan.priority,
          type: plan.type,
          estimated_duration: plan.engineHours,
          assigned_to: plan.assignedTo,
          notes: plan.description
        };
        
        // Add the task to our array
        tasks.push(task);
        
        // Calculate next date based on frequency
        if (plan.frequency === 'daily') {
          currentDate = addDays(currentDate, 1);
        } else if (plan.frequency === 'weekly') {
          currentDate = addWeeks(currentDate, 1);
        } else if (plan.frequency === 'monthly') {
          currentDate = addMonths(currentDate, 1);
        } else if (plan.frequency === 'quarterly') {
          currentDate = addMonths(currentDate, 3);
        } else if (plan.frequency === 'biannual') {
          currentDate = addMonths(currentDate, 6);
        } else if (plan.frequency === 'yearly') {
          currentDate = addYears(currentDate, 1);
        } else if (plan.frequency === 'custom') {
          // Use the custom interval and unit
          switch (plan.unit) {
            case 'days':
              currentDate = addDays(currentDate, plan.interval);
              break;
            case 'weeks':
              currentDate = addWeeks(currentDate, plan.interval);
              break;
            case 'months':
              currentDate = addMonths(currentDate, plan.interval);
              break;
            case 'years':
              currentDate = addYears(currentDate, plan.interval);
              break;
            default:
              // Default to days if unit is not recognized
              currentDate = addDays(currentDate, plan.interval);
          }
        }
      }
      
      // Create all tasks in the database
      for (const task of tasks) {
        await maintenanceService.addTask(task);
      }
      
      toast.success(`${tasks.length} tâches de maintenance créées jusqu'au ${endDate.toLocaleDateString()}`);
      
    } catch (error) {
      console.error('Error creating maintenance schedule:', error);
      toast.error('Erreur lors de la création du calendrier de maintenance');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    maintenancePlans,
    loadMaintenancePlans,
    createMaintenancePlan,
    updatePlan,
    createScheduleFromPlan
  };
};
