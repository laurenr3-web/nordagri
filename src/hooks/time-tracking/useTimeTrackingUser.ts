
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook pour récupérer l'identifiant de l'utilisateur connecté pour le suivi du temps
 * 
 * Obtient l'ID de l'utilisateur connecté à partir de la session Supabase.
 * 
 * @returns {Object} ID de l'utilisateur actuel
 */
export function useTimeTrackingUser() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUserId(data.session.user.id);
      }
    };
    
    fetchUserId();
  }, []);

  return { userId };
}
