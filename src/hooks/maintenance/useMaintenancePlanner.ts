
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MaintenanceTask, MaintenanceType, MaintenanceStatus, MaintenancePriority } from './maintenanceSlice';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { useQueryClient } from '@tanstack/react-query';

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
  active: boolean;
}

// Hook pour gérer les plans de maintenance périodiques
export function useMaintenancePlanner() {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const queryClient = useQueryClient();

  // Charger les plans de maintenance au démarrage
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const fetchedPlans = await maintenanceService.getMaintenancePlans();
        setPlans(fetchedPlans);
      } catch (error: any) {
        console.error('Erreur lors du chargement des plans de maintenance:', error);
        toast.error(`Impossible de charger les plans de maintenance: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Créer un plan de maintenance périodique
  const createMaintenancePlan = async (plan: Omit<MaintenancePlan, 'id' | 'active'>) => {
    try {
      setLoading(true);
      
      // Créer un nouveau plan dans la base de données
      const newPlan = await maintenanceService.addMaintenancePlan({
        ...plan,
        active: true
      });
      
      // Mettre à jour l'état local
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
      
      // Invalider les requêtes pour forcer un rafraîchissement des données
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['maintenancePlans'] });
      
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
    unit: MaintenanceUnit = 'months',
    startDate: Date = new Date()
  ): Date => {
    const nextDate = new Date(startDate);
    
    if (frequency === 'custom') {
      // Utiliser l'unité et l'intervalle personnalisés
      switch (unit) {
        case 'days':
          nextDate.setDate(nextDate.getDate() + interval);
          break;
        case 'weeks':
          nextDate.setDate(nextDate.getDate() + (interval * 7));
          break;
        case 'months':
          nextDate.setMonth(nextDate.getMonth() + interval);
          break;
        case 'years':
          nextDate.setFullYear(nextDate.getFullYear() + interval);
          break;
        case 'hours':
          // Pour les heures, on ajoute des millisecondes
          nextDate.setTime(nextDate.getTime() + (interval * 60 * 60 * 1000));
          break;
      }
    } else {
      // Utiliser la fréquence prédéfinie
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
      }
    }
    
    return nextDate;
  };
  
  // Générer les prochaines tâches de maintenance basées sur les plans actifs
  const generateScheduledTasks = async () => {
    try {
      setLoading(true);
      
      // Récupérer les plans actifs depuis la base de données
      const activePlans = (await maintenanceService.getMaintenancePlans()).filter(p => p.active);
      
      let tasksGenerated = 0;
      
      // Pour chaque plan actif, vérifier si une nouvelle tâche doit être créée
      for (const plan of activePlans) {
        // Logique pour décider si une nouvelle tâche doit être créée
        const now = new Date();
        
        // Si la date d'échéance est passée, générer une nouvelle tâche
        if (plan.nextDueDate.getTime() <= now.getTime()) {
          // Créer une nouvelle tâche
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
          
          // Calculer la prochaine date d'échéance
          const nextDueDate = calculateNextDueDate(
            plan.frequency,
            plan.interval,
            plan.unit,
            plan.nextDueDate // Utiliser la date d'échéance précédente comme point de départ
          );
          
          // Mettre à jour le plan avec la nouvelle date d'échéance
          await maintenanceService.updateMaintenancePlan(plan.id as number, {
            nextDueDate,
            lastPerformedDate: now
          });
          
          tasksGenerated++;
        }
      }
      
      // Mettre à jour l'état local avec les plans mis à jour
      const updatedPlans = await maintenanceService.getMaintenancePlans();
      setPlans(updatedPlans);
      
      // Invalider les requêtes pour forcer un rafraîchissement des données
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['maintenancePlans'] });
      
      if (tasksGenerated > 0) {
        toast.success(`${tasksGenerated} tâches de maintenance générées avec succès`);
      } else {
        toast.info('Aucune nouvelle tâche de maintenance à générer');
      }
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
