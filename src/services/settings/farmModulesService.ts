
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const farmModulesService = {
  async getFarmModules(farmId: string): Promise<string[]> {
    try {
      // D'abord, vérifions si la ferme utilise la table farm_settings
      const { data: farmSettingsData, error: farmSettingsError } = await supabase
        .from('farm_settings')
        .select('*')
        .eq('farm_id', farmId)
        .single();
      
      if (!farmSettingsError && farmSettingsData) {
        // Créer un tableau basé sur les modules activés dans farm_settings
        const modules: string[] = [];
        if (farmSettingsData.show_maintenance) modules.push('maintenance');
        if (farmSettingsData.show_parts) modules.push('parts');
        if (farmSettingsData.show_time_tracking) modules.push('time-tracking');
        if (farmSettingsData.show_fuel_log) modules.push('fuel');
        
        return modules;
      }
      
      return ['maintenance', 'parts', 'time-tracking', 'fuel']; // valeurs par défaut
      
    } catch (error) {
      console.error('Erreur lors de la récupération des modules:', error);
      return ['maintenance', 'parts', 'time-tracking', 'fuel']; // valeurs par défaut en cas d'erreur
    }
  },

  async updateFarmModules(farmId: string, modules: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('farm_settings')
        .upsert({
          farm_id: farmId,
          show_maintenance: modules.includes('maintenance'),
          show_parts: modules.includes('parts'),
          show_time_tracking: modules.includes('time-tracking'),
          show_fuel_log: modules.includes('fuel')
        }, { onConflict: 'farm_id' });
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour des modules:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de mettre à jour les modules'}`);
      return false;
    }
  }
};
