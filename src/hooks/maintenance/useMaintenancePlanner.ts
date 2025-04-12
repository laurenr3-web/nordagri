
import { useState, useCallback, useEffect } from 'react';
import { addDays, addWeeks, addMonths, format, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { MaintenanceFormValues, MaintenanceStatus, MaintenancePriority as TaskPriority } from './maintenanceSlice';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Export MaintenancePriority to avoid import issues
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

export type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'yearly';
export type MaintenanceUnit = 'days' | 'weeks' | 'months' | 'hours';
export type MaintenanceType = 'preventive' | 'corrective' | 'predictive' | 'condition-based';

export interface MaintenancePlan {
  id: number;
  title: string;
  description: string;
  equipmentId: number;
  equipmentName: string;
  frequency: MaintenanceFrequency;
  interval: number;
  unit: MaintenanceUnit;
  nextDueDate: Date;
  lastPerformedDate: Date | null;
  type: MaintenanceType;
  engineHours: number;
  active: boolean;
  priority: MaintenancePriority;
  assignedTo: string | null;
}

const isMaintenanceFrequency = (value: string): value is MaintenanceFrequency => {
  return ['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'yearly'].includes(value);
};

const isMaintenanceUnit = (value: string): value is MaintenanceUnit => {
  return ['days', 'weeks', 'months', 'hours'].includes(value);
};

const isMaintenanceType = (value: string): value is MaintenanceType => {
  return ['preventive', 'corrective', 'predictive', 'condition-based'].includes(value);
};

export const useMaintenancePlanner = () => {
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchMaintenancePlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les plans de maintenance
      const plans = await maintenanceService.getMaintenancePlans();
      setMaintenancePlans(plans);
    } catch (err: any) {
      console.error('Error fetching maintenance plans:', err);
      setError(err.message || "Erreur lors de la récupération des plans de maintenance");
      toast({
        title: "Erreur de chargement",
        description: err.message || 'Impossible de charger les plans de maintenance',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
      const newPlan = await maintenanceService.addMaintenancePlan(plan);
      
      // Mettre à jour l'état local
      setMaintenancePlans(prevPlans => [...prevPlans, newPlan]);
      
      // Invalider le cache pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['maintenancePlans'] });
      
      toast({
        title: "Succès",
        description: `Le plan de maintenance ${newPlan.title} a été ajouté avec succès`,
      });
      
      return newPlan;
    } catch (err: any) {
      console.error('Error adding maintenance plan:', err);
      setError(err.message || "Erreur lors de l'ajout du plan de maintenance");
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de l'ajout du plan de maintenance",
        variant: "destructive",
      });
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
      const updatedPlan = await maintenanceService.updateMaintenancePlan(planId, updates);
      
      // Mettre à jour l'état local
      setMaintenancePlans(prevPlans =>
        prevPlans.map(plan => plan.id === planId ? updatedPlan : plan)
      );
      
      // Invalider le cache pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['maintenancePlans'] });
      
      toast({
        title: "Succès",
        description: `Le plan de maintenance ${updatedPlan.title} a été mis à jour avec succès`,
      });
      
      return updatedPlan;
    } catch (err: any) {
      console.error('Error updating maintenance plan:', err);
      setError(err.message || "Erreur lors de la mise à jour du plan de maintenance");
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de la mise à jour du plan de maintenance",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const calculateNextDueDate = (
    frequency: MaintenanceFrequency,
    interval: number,
    unit: MaintenanceUnit,
    startDate: Date
  ): Date => {
    let nextDueDate: Date;

    switch (frequency) {
      case 'daily':
        nextDueDate = addDays(startDate, interval);
        break;
      case 'weekly':
        nextDueDate = addWeeks(startDate, interval);
        break;
      case 'monthly':
        nextDueDate = addMonths(startDate, interval);
        break;
      case 'quarterly':
        nextDueDate = addMonths(startDate, interval * 3);
        break;
      case 'biannual':
        nextDueDate = addMonths(startDate, interval * 6);
        break;
      case 'yearly':
        nextDueDate = addMonths(startDate, interval * 12);
        break;
      default:
        nextDueDate = startDate;
    }

    return nextDueDate;
  };

  const generateSchedule = (
    plan: MaintenancePlan,
    endDate: Date,
    onTaskCreated: (task: MaintenanceFormValues) => void
  ) => {
    let currentDate = plan.nextDueDate;

    while (isAfter(endDate, currentDate)) {
      const task: MaintenanceFormValues = {
        title: plan.title,
        equipment: plan.equipmentName,
        equipmentId: plan.equipmentId,
        type: plan.type as MaintenanceType, // Cast to the correct type
        status: 'scheduled' as MaintenanceStatus,
        priority: plan.priority as MaintenancePriority, // Keep this as MaintenancePriority
        dueDate: currentDate,
        engineHours: plan.engineHours,
        notes: plan.description,
        assignedTo: plan.assignedTo || '',
        partId: null
      };

      onTaskCreated(task);

      currentDate = calculateNextDueDate(
        plan.frequency,
        plan.interval,
        plan.unit,
        currentDate
      );
    }
  };

  const getFormattedNextDueDate = (plan: MaintenancePlan): string => {
    try {
      return format(plan.nextDueDate, 'PPP', { locale: fr });
    } catch (error) {
      console.error("Erreur lors du formatage de la date :", error);
      return 'Date inconnue';
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
    getFormattedNextDueDate,
    isMaintenanceFrequency,
    isMaintenanceUnit,
    isMaintenanceType
  };
};
