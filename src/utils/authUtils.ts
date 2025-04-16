
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility function to check the current authentication status
 * Logs the current session or error to the console
 * Useful for debugging authentication issues
 */
export const checkAuthStatus = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    console.log("=== Authentication Status Check ===");
    console.log("Session:", data.session);
    console.log("User:", data.session?.user);
    console.log("Error:", error);
    
    if (data.session) {
      console.log("Authentication: AUTHENTICATED");
      console.log("User ID:", data.session.user.id);
      console.log("Email:", data.session.user.email);
    } else {
      console.log("Authentication: NOT AUTHENTICATED");
    }
    
    console.log("=================================");
    
    return { 
      isAuthenticated: !!data.session,
      session: data.session,
      error 
    };
  } catch (catchError) {
    console.error("Error checking authentication status:", catchError);
    return { 
      isAuthenticated: false, 
      session: null, 
      error: catchError 
    };
  }
};

/**
 * Utility function to check if a user has write permissions on a specific table
 * Useful for debugging RLS issues
 */
export const checkTablePermissions = async (tableName: string, rowId?: string | number) => {
  try {
    console.log(`=== Checking permissions for ${tableName} ===`);
    
    // Try to select from the table
    const { data: readData, error: readError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    console.log("Read permissions:", readError ? "DENIED" : "GRANTED");
    if (readError) console.error("Read error:", readError);
    
    // Try to insert a dummy row (will be rolled back)
    const { data: insertData, error: insertError } = await supabase.rpc('check_insert_permission', {
      table_name: tableName
    });
    
    console.log("Insert permissions:", insertError || !insertData ? "DENIED" : "GRANTED");
    if (insertError) console.error("Insert error:", insertError);
    
    // If rowId is provided, check update permissions
    if (rowId) {
      const { data: updateData, error: updateError } = await supabase.rpc('check_update_permission', {
        table_name: tableName,
        row_id: rowId
      });
      
      console.log("Update permissions for row", rowId, ":", updateError || !updateData ? "DENIED" : "GRANTED");
      if (updateError) console.error("Update error:", updateError);
    }
    
    console.log("=================================");
    
    return {
      read: !readError,
      insert: !insertError && !!insertData,
      update: rowId ? (!updateError) : undefined
    };
  } catch (error) {
    console.error("Error checking table permissions:", error);
    return { read: false, insert: false, update: false };
  }
};

// Expose the function for tests via the console
if (typeof window !== 'undefined') {
  (window as any).checkAuthStatus = checkAuthStatus;
  (window as any).checkTablePermissions = checkTablePermissions;
}
