
import { useState } from 'react';
import { toast } from 'sonner';
import { MaintenanceTask, MaintenanceType, MaintenanceStatus, MaintenancePriority } from './maintenanceSlice';
import { maintenanceService } from '@/services/supabase/maintenanceService';

// Types pour les plans de maintenance
export type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'custom';
export type MaintenanceUnit = 'days' | 'weeks' | 'months' | 'years' | 'hours';

export interface MaintenancePlan {
  id?: number;
  title: string;
  description?: string;
  equipmentId: number;
  equipmentName: string;
  frequency: MaintenanceFrequency;
  interval: number;
  unit: MaintenanceUnit;
  type: MaintenanceType;
  priority: MaintenancePriority;
  engineHours: number;
  nextDueDate: Date;
  lastPerformedDate?: Date;
  assignedTo?: string;
  createdBy?: string;
  active: boolean;
}

// Hook pour gérer les plans de maintenance périodiques
export function useMaintenancePlanner() {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);

  // Créer un plan de maintenance périodique
  const createMaintenancePlan = async (plan: Omit<MaintenancePlan, 'id' | 'active'>) => {
    try {
      setLoading(true);
      
      // Créer un nouveau plan (pour l'instant stocké localement, à implémenter avec Supabase plus tard)
      const newPlan: MaintenancePlan = {
        ...plan,
        active: true,
        id: Date.now() // ID temporaire
      };
      
      setPlans(prevPlans => [...prevPlans, newPlan]);
      
      // Créer la première tâche de maintenance basée sur ce plan
      const task: Omit<MaintenanceTask, 'id'> = {
        title: plan.title,
        equipment: plan.equipmentName,
        equipmentId: plan.equipmentId,
        type: plan.type,
        status: 'scheduled' as MaintenanceStatus,
        priority: plan.priority,
        dueDate: plan.nextDueDate,
        engineHours: plan.engineHours,
        assignedTo: plan.assignedTo || '',
        notes: `Tâche générée automatiquement à partir du plan de maintenance: ${plan.description || ''}`,
      };
      
      await maintenanceService.addTask(task);
      
      toast.success('Plan de maintenance créé avec succès');
      return newPlan;
    } catch (error: any) {
      console.error('Erreur lors de la création du plan de maintenance:', error);
      toast.error(`Impossible de créer le plan de maintenance: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Calculer la prochaine date d'échéance
  const calculateNextDueDate = (
    frequency: MaintenanceFrequency,
    interval: number,
    startDate: Date = new Date()
  ): Date => {
    const nextDate = new Date(startDate);
    
    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (interval * 7));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + (interval * 3));
        break;
      case 'biannual':
        nextDate.setMonth(nextDate.getMonth() + (interval * 6));
        break;
      case 'annual':
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        break;
      case 'custom':
        // Géré par l'unité et l'intervalle
        break;
    }
    
    return nextDate;
  };
  
  // Générer les prochaines tâches de maintenance basées sur les plans actifs
  const generateScheduledTasks = async () => {
    try {
      setLoading(true);
      
      // Pour chaque plan actif, vérifier si une nouvelle tâche doit être créée
      for (const plan of plans.filter(p => p.active)) {
        // Logique pour décider si une nouvelle tâche doit être créée
        // Par exemple, si la dernière tâche a été complétée ou si la date d'échéance est passée
        
        if (plan.lastPerformedDate) {
          const nextDueDate = calculateNextDueDate(
            plan.frequency,
            plan.interval,
            plan.lastPerformedDate
          );
          
          // Si la prochaine date d'échéance est dans le futur proche (14 jours)
          if (nextDueDate.getTime() < new Date().getTime() + (14 * 24 * 60 * 60 * 1000)) {
            // Créer une nouvelle tâche
            const task: Omit<MaintenanceTask, 'id'> = {
              title: plan.title,
              equipment: plan.equipmentName,
              equipmentId: plan.equipmentId,
              type: plan.type,
              status: 'scheduled' as MaintenanceStatus,
              priority: plan.priority,
              dueDate: nextDueDate,
              engineHours: plan.engineHours,
              assignedTo: plan.assignedTo || '',
              notes: `Tâche générée automatiquement à partir du plan de maintenance: ${plan.description || ''}`,
            };
            
            await maintenanceService.addTask(task);
            
            // Mettre à jour la prochaine date d'échéance du plan
            const updatedPlan = { ...plan, nextDueDate };
            setPlans(prevPlans => 
              prevPlans.map(p => p.id === plan.id ? updatedPlan : p)
            );
          }
        }
      }
      
      toast.success('Tâches de maintenance générées avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la génération des tâches de maintenance:', error);
      toast.error(`Impossible de générer les tâches de maintenance: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    plans,
    createMaintenancePlan,
    calculateNextDueDate,
    generateScheduledTasks
  };
}
