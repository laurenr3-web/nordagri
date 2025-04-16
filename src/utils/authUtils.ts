
import { supabase } from '@/integrations/supabase/client';

/**
 * Check the authentication status of the current user
 */
export const checkAuthStatus = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Auth status check error:", error);
    throw new Error("Authentication error: " + error.message);
  }
  
  if (!data.session) {
    throw new Error("No active session found");
  }
  
  return {
    authenticated: !!data.session,
    userId: data.session?.user?.id,
    email: data.session?.user?.email
  };
};

/**
 * Check if the current user has permissions to access a table
 * @param tableName The name of the table to check permissions for
 * @param recordId Optional record ID to check for specific record permissions
 */
export const checkTablePermissions = async (tableName: string, recordId?: string) => {
  try {
    const { authenticated, userId } = await checkAuthStatus();
    
    if (!authenticated || !userId) {
      throw new Error("You must be logged in to access this resource");
    }
    
    // For time tracking, we primarily check if the user is authenticated
    // For specific record access, we could add additional checks here
    if (recordId) {
      // Example: Check if the user owns this record
      // This is a simplified check - in a real app, you'd query the table
      if (tableName === 'time_sessions') {
        const { data, error } = await supabase
          .from(tableName)
          .select('user_id')
          .eq('id', recordId)
          .single();
          
        if (error) {
          console.error("Permission check error:", error);
          throw new Error("Could not verify record permissions");
        }
        
        if (data?.user_id !== userId) {
          throw new Error("You don't have permission to modify this time entry");
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error("Permission check failed:", error);
    throw error;
  }
};
