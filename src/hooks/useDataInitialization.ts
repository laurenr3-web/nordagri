
import { useEffect, useState } from 'react';
import { applyPendingMigrations } from '@/utils/applyMigrations';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to handle initial data loading and setup
 */
export const useDataInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Check connection to Supabase
        const { error: connectionError } = await supabase.auth.getSession();
        if (connectionError) {
          throw new Error(`Failed to connect to Supabase: ${connectionError.message}`);
        }
        
        // Apply any pending database migrations
        await applyPendingMigrations();
        
        // Additional initialization steps can go here
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err : new Error('Unknown initialization error'));
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  return { isInitialized, isLoading, error };
};

export default useDataInitialization;
