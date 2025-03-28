
import axios from 'axios';

// Configuration du client Perplexity
const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;

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
    return Promise.reject(error);
  }
);
