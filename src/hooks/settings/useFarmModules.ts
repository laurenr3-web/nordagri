
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFarmId } from '@/hooks/useFarmId';

export interface FarmModules {
  show_equipment: boolean;
  show_maintenance: boolean;
  show_parts: boolean;
  show_time_tracking: boolean;
  show_interventions: boolean;
  show_reports: boolean;
}

export const defaultModules: FarmModules = {
  show_equipment: true,
  show_maintenance: true,
  show_parts: true,
  show_time_tracking: true,
  show_interventions: true,
  show_reports: true,
};

export function useFarmModules() {
  const { farmId, isLoading: isFarmLoading } = useFarmId();
  const [modules, setModules] = useState<FarmModules>(defaultModules);
  const [isLoading, setIsLoading] = useState(true);

  // Récupération des modules actifs pour la ferme
  useEffect(() => {
    const fetchFarmModules = async () => {
      if (!farmId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('farm_settings')
          .select('modules')
          .eq('farm_id', farmId)
          .single();

        if (error) {
          console.error('Erreur lors de la récupération des modules:', error);
          // Par défaut, tous les modules sont activés
          setModules(defaultModules);
        } else if (data?.modules) {
          // Si des paramètres existent, les utiliser
          setModules({
            ...defaultModules,
            ...data.modules
          });
        }
      } catch (error) {
        console.error('Exception lors de la récupération des modules:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isFarmLoading) {
      fetchFarmModules();
    }
  }, [farmId, isFarmLoading]);

  // Mise à jour des modules
  const updateModules = async (newModules: Partial<FarmModules>) => {
    if (!farmId) return false;

    try {
      setIsLoading(true);
      
      // Fusionner avec les modules existants
      const updatedModules = { ...modules, ...newModules };
      
      const { error } = await supabase
        .from('farm_settings')
        .upsert({ 
          farm_id: farmId,
          modules: updatedModules,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur lors de la mise à jour des modules:', error);
        toast.error('Erreur lors de la sauvegarde des paramètres');
        return false;
      }

      // Mise à jour du state local
      setModules(updatedModules);
      toast.success('Paramètres enregistrés avec succès');
      return true;
    } catch (error) {
      console.error('Exception lors de la mise à jour des modules:', error);
      toast.error('Une erreur est survenue');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    modules,
    isLoading,
    updateModules
  };
}
