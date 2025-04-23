
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSubscription() {
  const [sub, setSub] = useState<{
    plan: string;
    status: string;
    active: boolean;
    current_period_end?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("check-subscription", { body: {} });
    if (!error && data) {
      setSub(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return { subscription: sub, loading, refresh: fetchSubscription };
}
