
import { perplexityClient } from '@/services/perplexity/client';
import { parseResponse } from './parser';
import { PartTechnicalInfo, PerplexityTechnicalResponse } from './types';

export async function getPartTechnicalInfo(partReference: string, partName?: string): Promise<PartTechnicalInfo> {
  try {
    // Vérification des paramètres
    if (!partReference || partReference.trim() === '') {
      throw new Error('La référence de la pièce est requise');
    }

    // Préparation des messages avec une approche plus conversationnelle
    const messages = [
      {
        role: "system",
        content: `Vous êtes un expert spécialisé dans l'identification de pièces agricoles. 
        Utilisez votre connaissance des systèmes de numérotation des fabricants pour identifier au mieux cette pièce.
        Si vous ne trouvez aucune information spécifique, indiquez les fabricants susceptibles d'utiliser ce format de référence 
        et ce que pourrait être cette pièce basé sur les préfixes ou la structure du numéro.
        
        Fournissez vos réponses au format JSON avec la structure suivante: 
        { 
          "function": "description détaillée", 
          "compatibleEquipment": ["liste", "équipements"], 
          "installation": "guide d'installation", 
          "symptoms": "symptômes", 
          "maintenance": "conseils", 
          "alternatives": ["pièces alternatives"], 
          "warnings": "avertissements" 
        }. 
        
        Si vous ne connaissez pas certains détails, utilisez "Information non disponible" comme valeur.`
      },
      {
        role: "user",
        content: `Identifiez la pièce agricole avec la référence ${partReference}${partName ? ` (${partName})` : ''}.
        En particulier:
        1. De quel fabricant est-elle probablement (John Deere, Case IH, New Holland, Caterpillar, Kubota, etc.) ?
        2. À quel type d'équipement est-elle destinée ?
        3. Quelle est sa fonction ?
        4. Comment l'installer et la maintenir ?
        
        Si vous ne trouvez pas d'information précise sur cette référence, formulez une hypothèse basée sur le format du numéro 
        et les conventions de numérotation des fabricants d'équipements agricoles.
        
        IMPORTANT: Votre réponse doit être UNIQUEMENT un objet JSON valide, sans texte supplémentaire avant ou après.`
      }
    ];

    console.log(`Demande d'informations techniques pour: ${partReference}`);
    
    // Envoi de la requête avec les nouveaux messages structurés
    const response = await perplexityClient.post('/chat/completions', {
      model: "sonar-medium-online",
      messages: messages,
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
    
    // Transformation en format structuré avec la fonction de parsing
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
