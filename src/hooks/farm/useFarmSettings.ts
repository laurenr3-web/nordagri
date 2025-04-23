
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define explicit types instead of using recursive type inferences
export interface FarmSettings {
  id?: string;
  farm_id: string;
  show_maintenance: boolean;
  show_fuel_log: boolean;
  show_parts: boolean;
  show_time_tracking: boolean;
}

// Define a simple return type for the update operation
interface UpdateReturnType {
  error: Error | null;
  data: FarmSettings | null;
}

export function useFarmSettings(farmId?: string) {
  const [settings, setSettings] = useState<FarmSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!farmId) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('farm_settings')
        .select('*')
        .eq('farm_id', farmId)
        .maybeSingle();
      
      if (!error && data) {
        setSettings(data);
      } else if (error && error.code !== 'PGRST116') {
        console.error('Error fetching farm settings:', error);
      }
    } catch (err) {
      console.error('Exception when fetching farm settings:', err);
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  // Vérifie le rôle admin dans la ferme (accessible pour modifier)
  const checkIsAdmin = useCallback(async () => {
    if (!farmId) return setIsAdmin(false);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
      if (!userId) return setIsAdmin(false);
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('farm_id', farmId);
      
      setIsAdmin(!!data?.find(r => r.role === 'admin'));
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
    }
  }, [farmId]);

  // Fixed function to avoid excessive type inference
  const updateSettings = useCallback(async (partial: Partial<FarmSettings>): Promise<UpdateReturnType> => {
    if (!farmId || !settings?.id) {
      return {
        error: new Error('Missing farm ID or settings'),
        data: null
      };
    }
    
    setLoading(true);
    
    try {
      // Explicitly define the response structure
      const response = await supabase
        .from('farm_settings')
        .update(partial)
        .eq('id', settings.id)
        .select()
        .single();
        
      const error = response.error;
      const data = response.data as FarmSettings | null;
      
      if (!error && data) {
        setSettings(data);
      }
      
      setLoading(false);
      return { 
        error: error as Error | null, 
        data: data 
      };
    } catch (err) {
      setLoading(false);
      return { 
        error: err instanceof Error ? err : new Error('Unknown error'), 
        data: null 
      };
    }
  }, [farmId, settings]);

  useEffect(() => { 
    fetchSettings(); 
    checkIsAdmin(); 
  }, [fetchSettings, checkIsAdmin]);
  
  return { settings, loading, updateSettings, refresh: fetchSettings, isAdmin };
}
