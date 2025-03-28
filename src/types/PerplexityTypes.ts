
/**
 * Types pour l'intégration avec l'API Perplexity
 */

// Structure de base pour une pièce retournée par Perplexity
export interface PerplexityPart {
  id: string | number;
  name: string;
  reference: string;
  partNumber?: string;
  description?: string;
  manufacturer?: string;
  category?: string;
  price?: number | string;
  availability?: string;
  imageUrl?: string;
  url?: string;
  supplier?: string;
}

// Structure pour les résultats de comparaison de prix
export interface PerplexityPriceResult {
  vendor: string;
  price: number | string;
  currency: string;
  url?: string;
  availability: 'En stock' | 'Sur commande' | 'Non disponible';
  shippingCost?: number | string;
  estimatedDelivery?: string;
  condition?: string;
  lastUpdated: string;
}

// Structure pour les résultats de recherche technique
export interface PerplexityTechnicalInfo {
  property: string;
  value: string | number;
  description?: string;
  unit?: string;
}

// Configuration de requête Perplexity
export interface PerplexityRequestConfig {
  model: string;
  messages: PerplexityMessage[];
  temperature?: number;
  max_tokens?: number;
}

// Structure de message pour l'API Perplexity
export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Réponse de l'API Perplexity
export interface PerplexityResponse {
  id: string;
  model: string;
  choices: {
    message: PerplexityMessage;
    index: number;
    finish_reason: string;
  }[];
}
