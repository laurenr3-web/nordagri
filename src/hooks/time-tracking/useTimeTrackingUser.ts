
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
