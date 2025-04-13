
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns';
import { toast } from 'sonner';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { MaintenancePlan } from './types/maintenancePlanTypes';

export const useMaintenancePlanner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch all maintenance plans
  const { data: maintenancePlans = [], refetch } = useQuery({
    queryKey: ['maintenancePlans'],
    queryFn: maintenanceService.getMaintenancePlans,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Load maintenance plans
  const loadMaintenancePlans = useCallback(async () => {
    setIsLoading(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error loading maintenance plans:', error);
      toast.error("Erreur lors du chargement des plans de maintenance");
    } finally {
      setIsLoading(false);
    }
  }, [refetch]);
  
  // Create a new maintenance plan
  const createMaintenancePlan = useCallback(async (plan: Omit<MaintenancePlan, 'id'>) => {
    setIsLoading(true);
    try {
      const newPlan = await maintenanceService.addMaintenancePlan(plan);
      queryClient.invalidateQueries({ queryKey: ['maintenancePlans'] });
      toast.success("Plan de maintenance créé avec succès");
      return newPlan;
    } catch (error) {
      console.error('Error creating maintenance plan:', error);
      toast.error("Erreur lors de la création du plan de maintenance");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);
  
  // Update maintenance plan
  const updatePlan = useCallback(async (planId: number, updates: MaintenancePlan) => {
    setIsLoading(true);
    try {
      const updatedPlan = await maintenanceService.updateMaintenancePlan(planId, updates);
      queryClient.invalidateQueries({ queryKey: ['maintenancePlans'] });
      toast.success("Plan de maintenance mis à jour avec succès");
      return updatedPlan;
    } catch (error) {
      console.error(`Error updating maintenance plan ${planId}:`, error);
      toast.error("Erreur lors de la mise à jour du plan de maintenance");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);
  
  // Create schedule from a plan for the given time period
  const createScheduleFromPlan = useCallback(async (plan: MaintenancePlan, endDate: Date) => {
    setIsLoading(true);
    try {
      let currentDate = new Date(plan.nextDueDate);
      const tasks = [];
      
      while (currentDate <= endDate) {
        // Create a task for this date
        const task = {
          title: plan.title,
          notes: plan.description,
          equipment: plan.equipmentName,
          equipment_id: plan.equipmentId,
          due_date: currentDate,
          type: plan.type,
          priority: plan.priority,
          assigned_to: plan.assignedTo
        };
        
        tasks.push(task);
        
        // Calculate next date based on frequency
        switch (plan.frequency) {
          case 'daily':
            currentDate = addDays(currentDate, 1);
            break;
          case 'weekly':
            currentDate = addWeeks(currentDate, 1);
            break;
          case 'monthly':
            currentDate = addMonths(currentDate, 1);
            break;
          case 'quarterly':
            currentDate = addMonths(currentDate, 3);
            break;
          case 'biannual':
            currentDate = addMonths(currentDate, 6);
            break;
          case 'yearly':
            currentDate = addYears(currentDate, 1);
            break;
          case 'custom':
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
                currentDate = addDays(currentDate, plan.interval);
            }
            break;
          default:
            currentDate = addMonths(currentDate, 1); // Default to monthly
        }
      }
      
      // Create tasks in bulk
      for (const task of tasks) {
        await maintenanceService.addTask(task);
      }
      
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      toast.success(`${tasks.length} tâches de maintenance créées jusqu'à ${format(endDate, 'dd/MM/yyyy')}`);
    } catch (error) {
      console.error('Error creating schedule from plan:', error);
      toast.error("Erreur lors de la création du planning de maintenance");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  return {
    isLoading,
    maintenancePlans,
    loadMaintenancePlans,
    createMaintenancePlan,
    updatePlan,
    createScheduleFromPlan
  };
};
