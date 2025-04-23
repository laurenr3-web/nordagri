
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useOnboarding(userId?: string) {
  const [hasSeen, setHasSeen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFlag = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('has_seen_onboarding')
      .eq('id', userId)
      .single();
    if (!error && data) setHasSeen(Boolean(data.has_seen_onboarding));
    setLoading(false);
  }, [userId]);

  const setFlag = useCallback(async (value: boolean) => {
    if (!userId) return;
    setLoading(true);
    await supabase.from('profiles').update({ has_seen_onboarding: value }).eq('id', userId);
    setHasSeen(value);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchFlag();
  }, [fetchFlag]);

  return { hasSeen, setFlag, loading, refresh: fetchFlag };
}
