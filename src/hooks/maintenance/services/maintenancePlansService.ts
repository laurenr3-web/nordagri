
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { MaintenancePlan } from '../types/maintenancePlanTypes';
import { useToast } from '@/hooks/use-toast';

export const useMaintenancePlansService = () => {
  const { toast } = useToast();

  const fetchMaintenancePlans = async (): Promise<MaintenancePlan[]> => {
    try {
      // Charger les plans de maintenance
      const plans = await maintenanceService.getMaintenancePlans();
      return plans;
    } catch (err: any) {
      console.error('Error fetching maintenance plans:', err);
      toast({
        title: "Erreur de chargement",
        description: err.message || 'Impossible de charger les plans de maintenance',
        variant: "destructive",
      });
      return [];
    }
  };

  const addMaintenancePlan = async (plan: Omit<MaintenancePlan, 'id'>): Promise<MaintenancePlan | null> => {
    try {
      // Ajouter le plan de maintenance via le service
      const newPlan = await maintenanceService.addMaintenancePlan(plan);
      
      toast({
        title: "Succès",
        description: `Le plan de maintenance ${newPlan.title} a été ajouté avec succès`,
      });
      
      return newPlan;
    } catch (err: any) {
      console.error('Error adding maintenance plan:', err);
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de l'ajout du plan de maintenance",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateMaintenancePlan = async (planId: number, updates: Partial<MaintenancePlan>): Promise<MaintenancePlan | null> => {
    try {
      // Mettre à jour le plan de maintenance via le service
      const updatedPlan = await maintenanceService.updateMaintenancePlan(planId, updates);
      
      toast({
        title: "Succès",
        description: `Le plan de maintenance ${updatedPlan.title} a été mis à jour avec succès`,
      });
      
      return updatedPlan;
    } catch (err: any) {
      console.error('Error updating maintenance plan:', err);
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de la mise à jour du plan de maintenance",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    fetchMaintenancePlans,
    addMaintenancePlan,
    updateMaintenancePlan,
  };
};
