
import { supabase, withRetry } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { getSupabaseErrorMessage } from "@/utils/errorHandling";

interface AuthStatus {
  isAuthenticated: boolean;
  session: any;
  error?: Error;
  user?: any;
}

/**
 * Utility function to check the current authentication status
 * Logs the current session or error to the console
 * Useful for debugging authentication issues
 */
export const checkAuthStatus = async (): Promise<AuthStatus> => {
  let retryCount = 0;
  const maxRetries = 3;
  
  const checkAuth = async (): Promise<AuthStatus> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      console.log("=== Authentication Status Check ===");
      console.log("Session:", data?.session);
      console.log("User:", data?.session?.user);
      console.log("Error:", error);
      
      if (data?.session) {
        console.log("Authentication: AUTHENTICATED");
        console.log("User ID:", data.session.user.id);
        console.log("Email:", data.session.user.email);
        console.log("Session expiry:", new Date(data.session.expires_at * 1000));
        
        // Vérifier si le jeton expire bientôt
        const expiryTime = new Date(data.session.expires_at * 1000);
        const now = new Date();
        const timeToExpiry = expiryTime.getTime() - now.getTime();
        
        // Si le jeton expire dans moins de 5 minutes
        if (timeToExpiry < 5 * 60 * 1000) {
          console.log("Token expiring soon, refreshing session");
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (!refreshError) {
            console.log("Token refreshed successfully");
            return { 
              isAuthenticated: true, 
              session: refreshData.session,
              user: refreshData.session?.user
            };
          } else {
            console.error("Error refreshing token:", refreshError);
          }
        }
        
        return { 
          isAuthenticated: true, 
          session: data.session,
          user: data.session.user
        };
      } else {
        console.log("Authentication: NOT AUTHENTICATED");
        
        return { 
          isAuthenticated: false, 
          session: null,
          error 
        };
      }
    } catch (error) {
      console.error("Error checking authentication status:", error);
      
      // Réessai en cas d'erreur réseau
      if ((error instanceof TypeError || (error as Error).message.includes('network')) && retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying authentication check (${retryCount}/${maxRetries})`);
        
        // Attendre avant de réessayer (backoff exponentiel)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
        return checkAuth();
      }
      
      return { 
        isAuthenticated: false, 
        session: null, 
        error: error as Error
      };
    } finally {
      console.log("=================================");
    }
  };
  
  try {
    return await checkAuth();
  } catch (error) {
    console.error("Fatal error in checkAuthStatus:", error);
    toast.error('Problème lors de la vérification de l\'authentification', {
      description: getSupabaseErrorMessage(error as Error)
    });
    
    return {
      isAuthenticated: false,
      session: null,
      error: error as Error
    };
  }
};

// Exposer la fonction pour les tests via la console
if (typeof window !== 'undefined') {
  (window as any).checkAuthStatus = checkAuthStatus;
}
