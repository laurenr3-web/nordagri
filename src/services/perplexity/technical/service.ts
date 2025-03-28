
import { perplexityClient } from '@/services/perplexity/client';
import { parseResponse } from './parser';
import { PartTechnicalInfo, PerplexityTechnicalResponse } from './types';

export async function getPartTechnicalInfo(partReference: string, partName?: string): Promise<PartTechnicalInfo> {
  try {
    // Vérification des paramètres
    if (!partReference || partReference.trim() === '') {
      throw new Error('La référence de la pièce est requise');
    }

    // Préparation de la requête
    const partNameInfo = partName ? `, nom: ${partName}` : '';
    const requestContent = `Recherchez des informations techniques détaillées sur la pièce agricole avec la référence ${partReference}${partNameInfo}. 
      Incluez la fonction, les équipements compatibles, le guide d'installation, les symptômes de défaillance, l'entretien requis, 
      les références alternatives si disponibles, et les avertissements importants. 
      Répondez au format JSON avec les champs: function, compatibleEquipment (array), installation, symptoms, maintenance, alternatives (array), warnings.`;

    console.log(`Demande d'informations techniques pour: ${partReference}`);
    
    // Envoi de la requête
    const response = await perplexityClient.post('/chat/completions', {
      model: "sonar-medium-online",
      messages: [
        {
          role: "system",
          content: "Vous êtes un assistant spécialisé dans les pièces détachées agricoles. Retournez les informations techniques demandées au format JSON structuré."
        },
        {
          role: "user",
          content: requestContent
        }
      ],
      temperature: 0.2,
      max_tokens: 2048
    });

    // Traitement de la réponse
    if (!response.data || !response.data.choices || !response.data.choices[0]?.message?.content) {
      console.error("Réponse API Perplexity invalide:", response.data);
      throw new Error("Format de réponse API invalide");
    }

    const content = response.data.choices[0].message.content;
    console.log("Réponse technique reçue de Perplexity");
    
    // Transformation en format structuré avec la nouvelle fonction de parsing améliorée
    return parseResponse(content);
    
  } catch (error) {
    console.error("Erreur lors de la récupération des informations techniques:", error);
    
    // Amélioration des messages d'erreur pour le débogage
    if (error.response) {
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
