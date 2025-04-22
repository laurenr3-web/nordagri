
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

  // Fetch active modules for the farm
  useEffect(() => {
    const fetchFarmModules = async () => {
      if (!farmId) {
        setIsLoading(false);
        return;
      }

      try {
        // We need to use a raw query because TypeScript doesn't know about the farm_settings table yet
        const { data: settingsData, error: settingsError } = await supabase
          .from('farm_settings')
          .select('modules')
          .eq('farm_id', farmId)
          .maybeSingle() as any;

        if (settingsError) {
          console.error('Error fetching modules:', settingsError);
          // Default: all modules are enabled
          setModules(defaultModules);
        } else if (settingsData?.modules) {
          // If settings exist, use them
          setModules({
            ...defaultModules,
            ...settingsData.modules
          });
        }
      } catch (error) {
        console.error('Exception fetching modules:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isFarmLoading) {
      fetchFarmModules();
    }
  }, [farmId, isFarmLoading]);

  // Update modules
  const updateModules = async (newModules: Partial<FarmModules>) => {
    if (!farmId) return false;

    try {
      setIsLoading(true);
      
      // Merge with existing modules
      const updatedModules = { ...modules, ...newModules };
      
      // Use raw query for upsert since TypeScript doesn't know about farm_settings yet
      const { error } = await supabase
        .from('farm_settings')
        .upsert({ 
          farm_id: farmId,
          modules: updatedModules,
          updated_at: new Date().toISOString()
        } as any);

      if (error) {
        console.error('Error updating modules:', error);
        toast.error('Error saving settings');
        return false;
      }

      // Update local state
      setModules(updatedModules);
      toast.success('Settings saved successfully');
      return true;
    } catch (error) {
      console.error('Exception updating modules:', error);
      toast.error('An error occurred');
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
