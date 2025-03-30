
import { perplexityClient } from '@/services/perplexity/client';
import { parseResponse } from './parser';
import { PartTechnicalInfo, PerplexityTechnicalResponse } from './types';

export async function getPartTechnicalInfo(partReference: string, partName?: string): Promise<PartTechnicalInfo> {
  try {
    // Vérification des paramètres
    if (!partReference || partReference.trim() === '') {
      throw new Error('La référence de la pièce est requise');
    }

    // Utiliser la référence exactement comme fournie, sans modification
    console.log(`Demande d'informations techniques pour: ${partReference}`);
    
    // Simplification du prompt système et du format de requête
    const messages = [
      {
        role: "system",
        content: "Vous êtes un assistant spécialisé dans la recherche d'informations techniques précises."
      },
      {
        role: "user",
        content: `Donnez-moi toutes les informations techniques disponibles sur la pièce agricole avec la référence ${partReference}${partName ? ` (${partName})` : ''}. 
        Incluez le fabricant, l'équipement compatible, la fonction, les instructions d'installation, les signes de défaillance et les conseils d'entretien.
        
        Formatez votre réponse en JSON avec les champs suivants:
        {
          "function": "description détaillée",
          "compatibleEquipment": ["liste", "équipements"],
          "installation": "instructions",
          "symptoms": "signes défaillance",
          "maintenance": "conseils entretien",
          "alternatives": ["pièces alternatives"],
          "warnings": "précautions"
        }`
      }
    ];
    
    // Configuration de la requête avec les paramètres simplifiés
    const response = await perplexityClient.post('/chat/completions', {
      model: "sonar-medium-online",
      messages: messages,
      temperature: 0.1,
      max_tokens: 2000
    });

    // Déboguer la réponse brute
    if (response.data && response.data.choices && response.data.choices[0]?.message?.content) {
      console.log("Réponse brute de Perplexity:", response.data.choices[0].message.content);
    } else {
      console.error("Structure de réponse inattendue:", response.data);
    }

    // Traitement de la réponse
    if (!response.data || !response.data.choices || !response.data.choices[0]?.message?.content) {
      console.error("Réponse API Perplexity invalide:", response.data);
      throw new Error("Format de réponse API invalide");
    }

    const content = response.data.choices[0].message.content;
    console.log("Réponse technique reçue de Perplexity");
    
    // Transformation en format structuré avec la fonction de parsing
    return parseResponse(content);
    
  } catch (error) {
    console.error("Erreur lors de la récupération des informations techniques:", error);
    
    // Amélioration du débogage pour les erreurs API
    if (error.response) {
      console.error("Erreur API complète:", error);
      console.error("Détails de l'erreur API:", error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        throw new Error("Erreur d'authentification: clé API Perplexity invalide ou manquante");
      } else if (error.response.status === 429) {
        throw new Error("Limite de requêtes API Perplexity atteinte. Veuillez réessayer plus tard.");
      } else {
        throw new Error(`Erreur API Perplexity (${error.response.status}): ${error.response.data?.error?.message || "Détails non disponibles"}`);
      }
    } else if (error.request) {
      console.error("Pas de réponse reçue:", error.request);
      throw new Error("Impossible de contacter l'API Perplexity. Vérifiez votre connexion Internet.");
    }
    
    // Rethrow avec un message plus explicite si c'est un autre type d'erreur
    throw error.message ? error : new Error("Erreur lors de la récupération des informations techniques");
  }
}
