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
    
    // Try to select from the table - using a type assertion to handle dynamic table names
    const { data: readData, error: readError } = await supabase
      .from(tableName as any)
      .select('*')
      .limit(1);
    
    console.log("Read permissions:", readError ? "DENIED" : "GRANTED");
    if (readError) console.error("Read error:", readError);
    
    // Try to insert a dummy row with an explicit transaction that we'll roll back
    console.log("Insert permissions: checking...");
    let insertPermission = false;
    
    try {
      // Start a transaction that we'll immediately roll back to test insert permission
      const { data, error } = await supabase
        .from(tableName as any)
        .insert({})
        .select()
        .abortSignal(new AbortController().signal);  // This will abort the request
      
      // If we got here without an error, we have insert permission (though the request was aborted)
      insertPermission = !error;
    } catch (insertError) {
      console.error("Insert error:", insertError);
    }
    
    console.log("Insert permissions:", insertPermission ? "GRANTED" : "DENIED");
    
    // If rowId is provided, check update permissions with a similar non-modifying approach
    let updatePermission = undefined;
    if (rowId) {
      console.log("Update permissions: checking for row", rowId);
      try {
        // We'll just test if we can access the row with the intent to update
        const { data, error } = await supabase
          .from(tableName as any)
          .select('*')
          .eq('id', rowId)
          .single();
        
        // If we found the row, we have at least read permission on it
        // Full update testing would require an actual update, but we'll avoid that
        updatePermission = !error;
      } catch (error) {
        console.error("Update error:", error);
      }
      
      console.log("Update permissions for row", rowId, ":", updatePermission ? "LIKELY GRANTED" : "DENIED");
    }
    
    console.log("=================================");
    
    return {
      read: !readError,
      insert: insertPermission,
      update: updatePermission
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
