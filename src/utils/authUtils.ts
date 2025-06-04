
import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

/**
 * Check authentication status and log details
 */
export const checkAuthStatus = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logger.error('Auth check error:', error);
      return;
    }
    
    if (session?.user) {
      logger.log('User authenticated:', session.user.id);
    } else {
      logger.log('No authenticated user');
    }
  } catch (error) {
    logger.error('Auth status check failed:', error);
  }
};

/**
 * Check table permissions for debugging
 */
export const checkTablePermissions = async (tableName: string, id?: string) => {
  try {
    logger.log(`Checking permissions for table: ${tableName}${id ? ` (id: ${id})` : ''}`);
    
    // Simple select query to test permissions
    const query = supabase.from(tableName as any).select('id').limit(1);
    
    if (id) {
      query.eq('id', id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      logger.error(`Permission check failed for ${tableName}:`, error);
    } else {
      logger.log(`Permission check passed for ${tableName}:`, data?.length || 0, 'rows accessible');
    }
  } catch (error) {
    logger.error(`Permission check error for ${tableName}:`, error);
  }
};
