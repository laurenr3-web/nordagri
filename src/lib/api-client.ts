
import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Create an axios instance with defaults
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get the current session from Supabase
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      
      // If session exists, attach the access token
      if (session) {
        config.headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Error getting auth session:', error);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common error cases
    if (error.response) {
      // Server responded with error
      if (error.response.status === 401) {
        // Handle unauthorized
        toast.error('Session expirée. Veuillez vous reconnecter.');
        // Redirect to login
        window.location.href = '/auth';
      } else if (error.response.status === 403) {
        toast.error('Accès refusé à cette ressource');
      } else if (error.response.status === 500) {
        toast.error('Erreur serveur. Veuillez réessayer plus tard.');
      } else {
        // Handle other status codes
        const message = error.response.data?.message || 'Une erreur est survenue';
        toast.error(message);
      }
    } else if (error.request) {
      // No response received
      toast.error('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } else {
      // Request setup error
      toast.error(`Erreur de requête: ${error.message}`);
    }
    
    // Log the error for debugging
    console.error('API Request Error:', error);
    
    return Promise.reject(error);
  }
);

// Utility function to make typed requests
export const api = {
  get: <T>(url: string, config = {}) => 
    apiClient.get<T>(url, config).then(response => response.data),
  
  post: <T>(url: string, data = {}, config = {}) => 
    apiClient.post<T>(url, data, config).then(response => response.data),
  
  put: <T>(url: string, data = {}, config = {}) => 
    apiClient.put<T>(url, data, config).then(response => response.data),
  
  patch: <T>(url: string, data = {}, config = {}) => 
    apiClient.patch<T>(url, data, config).then(response => response.data),
  
  delete: <T>(url: string, config = {}) => 
    apiClient.delete<T>(url, config).then(response => response.data),
};

export default apiClient;
