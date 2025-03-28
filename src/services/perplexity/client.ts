
import axios from 'axios';

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
  (response) => response,
  (error) => {
    console.error('Erreur API Perplexity:', error);
    
    // Ajouter plus de détails sur l'erreur
    if (error.response) {
      console.error('Réponse d\'erreur:', error.response.status, error.response.data);
      
      // Gérer le cas d'absence de clé API ou de clé invalide
      if (error.response.status === 401) {
        console.error('Clé API Perplexity non valide ou manquante. Vérifiez votre configuration.');
        error.message = 'Clé API Perplexity non valide ou manquante. Vérifiez votre configuration.';
      }
    } else if (error.request) {
      console.error('Aucune réponse reçue pour la requête');
      error.message = 'Impossible de se connecter au service Perplexity. Vérifiez votre connexion internet.';
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

