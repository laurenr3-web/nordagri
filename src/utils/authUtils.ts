
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
      
      // Ne pas faire d'appels récursifs aux tables avec des politiques RLS problématiques
      // Vérifier simplement si la session existe
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

// Exposer la fonction pour les tests via la console
if (typeof window !== 'undefined') {
  (window as any).checkAuthStatus = checkAuthStatus;
}
