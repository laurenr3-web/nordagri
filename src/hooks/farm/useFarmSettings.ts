
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FarmSettings {
  id?: string;
  farm_id: string;
  show_maintenance: boolean;
  show_fuel_log: boolean;
  show_parts: boolean;
  show_time_tracking: boolean;
}

export function useFarmSettings(farmId?: string) {
  const [settings, setSettings] = useState<FarmSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!farmId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('farm_settings')
      .select('*')
      .eq('farm_id', farmId)
      .maybeSingle();
    if (!error && data) setSettings(data);
    setLoading(false);
  }, [farmId]);

  // Vérifie le rôle admin dans la ferme (accessible pour modifier)
  const checkIsAdmin = useCallback(async () => {
    if (!farmId) return setIsAdmin(false);
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) return setIsAdmin(false);
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('farm_id', farmId);
    setIsAdmin(!!data?.find(r => r.role === 'admin'));
  }, [farmId]);

  const updateSettings = useCallback(async (partial: Partial<FarmSettings>) => {
    if (!farmId || !settings) return;
    setLoading(true);
    const { error, data } = await supabase
      .from('farm_settings')
      .update(partial)
      .eq('farm_id', farmId)
      .select()
      .single();
    if (!error && data) setSettings(data);
    setLoading(false);
    return { error, data };
  }, [farmId, settings]);

  useEffect(() => { fetchSettings(); checkIsAdmin(); }, [fetchSettings, checkIsAdmin]);
  return { settings, loading, updateSettings, refresh: fetchSettings, isAdmin };
}
