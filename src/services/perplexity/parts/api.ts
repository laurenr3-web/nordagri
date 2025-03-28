
import { perplexityClient, checkApiKey } from '@/services/perplexity/client';
import { toast } from 'sonner';

/**
 * Core API functions for interacting with Perplexity
 */
export const partsApi = {
  /**
   * Validate API key and show error if not configured
   */
  validateApiKey(): boolean {
    const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
    if (!apiKey) {
      console.error("Clé API Perplexity non configurée");
      toast.error("Configuration API manquante", {
        description: "Veuillez configurer une clé API Perplexity dans vos variables d'environnement."
      });
      return false;
    }
    return true;
  },

  /**
   * Execute a query with proper error handling
   */
  async executeQuery(messages: any[]): Promise<any> {
    try {
      if (!this.validateApiKey()) {
        return null;
      }

      const response = await perplexityClient.post('/chat/completions', {
        model: "sonar-medium-online",
        messages,
        temperature: 0.2
      });
      
      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error("Erreur lors de la requête Perplexity:", error);
      
      if (error.response) {
        console.error("Données de l'erreur:", error.response.data);
        console.error("Statut:", error.response.status);
        
        if (error.response.status === 401) {
          toast.error("Erreur d'authentification API", { 
            description: "Vérifiez votre clé API Perplexity" 
          });
        } else {
          toast.error(`Erreur API (${error.response.status})`, { 
            description: error.response.data?.error?.message || "Détails non disponibles" 
          });
        }
      } else if (error.request) {
        console.error("Pas de réponse reçue:", error.request);
        toast.error("Impossible de contacter l'API", { 
          description: "Vérifiez votre connexion Internet" 
        });
      } else {
        toast.error("Erreur de requête", { 
          description: error.message || "Une erreur inattendue est survenue" 
        });
      }
      
      throw error;
    }
  }
};
