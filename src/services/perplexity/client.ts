
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
    // Simplified success logging
    console.log(`✅ Perplexity API (${response.config.url}): Status ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ Erreur API Perplexity:', error);
    
    if (error.response) {
      console.error(`Détails: ${error.response.status}`, error.response.data);
      
      if (error.response.status === 401) {
        toast.error('Clé API Perplexity invalide', {
          description: 'Vérifiez votre configuration dans les variables d\'environnement'
        });
      } else if (error.response.status === 429) {
        toast.error('Limite API dépassée', {
          description: 'Vous avez atteint la limite de requêtes Perplexity'
        });
      } else {
        toast.error(`Erreur Perplexity (${error.response.status})`, {
          description: error.response.data?.error?.message || 'Problème avec la requête'
        });
      }
    } else if (error.request) {
      console.error('Aucune réponse reçue:', error.request);
      toast.error('Erreur de connexion', {
        description: 'Impossible de contacter l\'API Perplexity'
      });
    } else {
      console.error('Erreur:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Méthode pour vérifier la validité de la clé API
export const checkApiKey = () => {
  if (!PERPLEXITY_API_KEY || PERPLEXITY_API_KEY.length === 0) {
    console.error('⚠️ Clé API Perplexity manquante');
    return false;
  }
  return true;
};

// Fonction simplifiée pour tester la connexion à l'API
export const testPerplexityConnection = async (): Promise<boolean> => {
  if (!checkApiKey()) {
    toast.error('Clé API manquante', {
      description: 'Configurez votre clé API Perplexity dans .env.development'
    });
    return false;
  }
  
  try {
    console.log('🔍 Test de connexion Perplexity...');
    const response = await perplexityClient.post('/chat/completions', {
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: "Vous êtes un assistant de diagnostic. Répondez uniquement 'OK'."
        },
        {
          role: "user",
          content: "Test de connexion"
        }
      ],
      max_tokens: 5,
      temperature: 0.0
    });
    
    console.log('✅ Test de connexion Perplexity réussi:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Échec du test de connexion Perplexity:', error);
    return false;
  }
};

// Fonction de base pour une requête Perplexity simplifiée
export const simplePerplexityQuery = async (prompt: string): Promise<string | null> => {
  if (!checkApiKey()) {
    toast.error('Clé API manquante');
    return null;
  }
  
  try {
    console.log('🔍 Requête Perplexity:', prompt.substring(0, 50) + '...');
    const response = await perplexityClient.post('/chat/completions', {
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: "Vous êtes un expert en pièces détachées agricoles. Répondez de manière concise et précise."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 500
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Erreur requête Perplexity:', error);
    return null;
  }
};
