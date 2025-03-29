
import axios from 'axios';
import { toast } from 'sonner';

// Configuration du client Perplexity
const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY || '';

export const perplexityClient = axios.create({
  baseURL: 'https://api.perplexity.ai',
  headers: {
    'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour gérer les erreurs
perplexityClient.interceptors.response.use(
  (response) => {
    // Log de debug pour les réponses réussies
    console.log('Réponse Perplexity API reçue avec succès:', {
      status: response.status,
      endpoint: response.config.url,
      dataSize: JSON.stringify(response.data).length
    });
    return response;
  },
  (error) => {
    console.error('Erreur API Perplexity:', error);
    
    // Ajouter plus de détails sur l'erreur
    if (error.response) {
      console.error('Réponse d\'erreur:', error.response.status, error.response.data);
      
      // Gérer le cas d'absence de clé API ou de clé invalide
      if (error.response.status === 401) {
        console.error('Clé API Perplexity non valide ou manquante. Vérifiez votre configuration.');
        error.message = 'Clé API Perplexity non valide ou manquante. Vérifiez votre configuration.';
        
        toast.error('Erreur d\'authentification API', {
          description: 'Votre clé API Perplexity est invalide ou manquante. Vérifiez votre configuration.'
        });
      } else if (error.response.status === 429) {
        console.error('Limite de requêtes Perplexity API dépassée');
        error.message = 'Limite de requêtes Perplexity API dépassée. Veuillez réessayer plus tard.';
        
        toast.error('Limite API dépassée', {
          description: 'Vous avez atteint la limite de requêtes Perplexity. Réessayez plus tard.'
        });
      }
    } else if (error.request) {
      console.error('Aucune réponse reçue pour la requête');
      error.message = 'Impossible de se connecter au service Perplexity. Vérifiez votre connexion internet.';
      
      toast.error('Erreur de connexion', {
        description: 'Impossible de se connecter au service Perplexity. Vérifiez votre connexion internet.'
      });
    } else {
      console.error('Erreur lors de la configuration de la requête:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Méthode pour vérifier la validité de la clé API
export const checkApiKey = () => {
  return PERPLEXITY_API_KEY && PERPLEXITY_API_KEY.length > 0;
};

// Fonction pour tester la connexion à l'API
export const testPerplexityConnection = async (): Promise<boolean> => {
  if (!checkApiKey()) {
    console.error('Clé API manquante. Impossible de tester la connexion.');
    toast.error('Clé API manquante', {
      description: 'Configurez votre clé API Perplexity pour utiliser cette fonctionnalité.'
    });
    return false;
  }
  
  try {
    const response = await perplexityClient.post('/chat/completions', {
      model: "sonar-small-online",
      messages: [
        {
          role: "system",
          content: "Répondez uniquement 'OK' pour vérifier la connexion."
        },
        {
          role: "user",
          content: "Test de connexion"
        }
      ],
      max_tokens: 5,
      temperature: 0.0
    });
    
    console.log('Test de connexion Perplexity réussi:', response.data);
    return true;
  } catch (error) {
    console.error('Échec du test de connexion Perplexity:', error);
    return false;
  }
};
