
import { supabase, checkSupabaseConnection } from '@/integrations/supabase/client';
import { withTimeout } from './timeoutUtils';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

/**
 * Utility functions for session validation
 */
export const validateConnection = async (location: any): Promise<boolean> => {
  try {
    const isConnected = await withTimeout(
      checkSupabaseConnection(),
      3000,
      'Timeout de connexion'
    );
    
    if (!isConnected) {
      logger.error('Connexion à Supabase impossible');
      if (location.pathname !== '/auth') {
        toast.error('Service temporairement indisponible', {
          description: 'Tentative de reconnexion...',
          duration: 3000
        });
      }
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error('Erreur de connexion:', error);
    return false;
  }
};

export const getSessionWithTimeout = async () => {
  return await withTimeout(
    supabase.auth.getSession(),
    3000,
    'Timeout dépassé'
  );
};
