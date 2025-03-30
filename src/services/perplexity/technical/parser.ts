
import { PartTechnicalInfo } from './types';
import { extractInformationFromText } from './utils/textExtraction';

/**
 * Improved function to process and clean Perplexity API responses
 */
function processResponse(content: string): PartTechnicalInfo {
  try {
    // Nettoyage du contenu - supprimer les backticks et la syntaxe JSON
    let cleanContent = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    // Essayer de trouver un objet JSON valide
    let jsonMatch = cleanContent.match(/{[\s\S]*}/);
    let parsedData = null;
    
    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn("Impossible de parser le JSON trouvé:", e);
      }
    }
    
    // Si nous avons du JSON valide, l'utiliser
    if (parsedData) {
      return {
        function: typeof parsedData.function === 'string' ? parsedData.function : "Information non disponible",
        compatibleEquipment: Array.isArray(parsedData.compatibleEquipment) ? parsedData.compatibleEquipment : [],
        installation: typeof parsedData.installation === 'string' ? parsedData.installation : "Information non disponible",
        symptoms: typeof parsedData.symptoms === 'string' ? parsedData.symptoms : "Information non disponible",
        maintenance: typeof parsedData.maintenance === 'string' ? parsedData.maintenance : "Information non disponible",
        alternatives: Array.isArray(parsedData.alternatives) ? parsedData.alternatives : [],
        warnings: typeof parsedData.warnings === 'string' ? parsedData.warnings : ""
      };
    }
    
    // Sinon, utiliser la méthode de secours pour extraire du texte structuré
    return extractInformationFromText(cleanContent);
  } catch (error) {
    console.error("Erreur lors du traitement de la réponse:", error);
    return createDefaultTechnicalInfo();
  }
}

export function parseResponse(content: string): PartTechnicalInfo {
  try {
    // Vérifier si le contenu est vide ou null
    if (!content || content.trim() === '') {
      console.error("Contenu de réponse vide ou null");
      return createDefaultTechnicalInfo();
    }

    // Utiliser la nouvelle fonction de traitement améliorée
    return processResponse(content);
  } catch (error) {
    console.error("Erreur lors du parsing JSON:", error);
    console.log("Contenu brut:", content);
    
    // Créer un résultat formaté à partir du texte brut ou retourner une structure par défaut
    try {
      return extractInformationFromText(content);
    } catch (extractError) {
      console.error("Erreur lors de l'extraction du texte:", extractError);
      return createDefaultTechnicalInfo();
    }
  }
}

// Fonction pour créer une structure d'information technique par défaut
function createDefaultTechnicalInfo(): PartTechnicalInfo {
  return {
    function: "Information non disponible",
    compatibleEquipment: [],
    installation: "Information non disponible",
    symptoms: "Information non disponible",
    maintenance: "Information non disponible",
    alternatives: [],
    warnings: ""
  };
}
