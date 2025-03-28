
import { PartTechnicalInfo } from './types';

export function parseResponse(content: string): PartTechnicalInfo {
  try {
    // Essayer de parser le JSON directement
    let parsedData;
    
    try {
      // D'abord essayer de parser directement
      parsedData = JSON.parse(content);
    } catch (parseError) {
      // Ensuite chercher un bloc JSON entre ```
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        // Chercher quelque chose qui ressemble à un objet JSON
        const potentialJson = content.match(/{[\s\S]*?}/);
        if (potentialJson) {
          parsedData = JSON.parse(potentialJson[0]);
        } else {
          throw new Error("Aucun JSON valide trouvé dans la réponse");
        }
      }
    }
    
    // Vérifier et compléter les données si nécessaires
    return {
      function: parsedData.function || parsedData.utilisation || parsedData["1"] || "Information non disponible",
      compatibleEquipment: Array.isArray(parsedData.compatibleEquipment) 
        ? parsedData.compatibleEquipment 
        : parsedData.equipementsCompatibles 
        ? (Array.isArray(parsedData.equipementsCompatibles) ? parsedData.equipementsCompatibles : [parsedData.equipementsCompatibles])
        : parsedData.compatibleEquipment 
          ? [parsedData.compatibleEquipment] 
          : parsedData["2"]
          ? (Array.isArray(parsedData["2"]) ? parsedData["2"] : [parsedData["2"]])
          : [],
      installation: parsedData.installation || parsedData.guide || parsedData["3"] || "Information non disponible",
      symptoms: parsedData.symptoms || parsedData.defaillance || parsedData["4"] || "Information non disponible",
      maintenance: parsedData.maintenance || parsedData.entretien || parsedData["5"] || "Information non disponible",
      alternatives: Array.isArray(parsedData.alternatives) 
        ? parsedData.alternatives 
        : parsedData["6"]
        ? (Array.isArray(parsedData["6"]) ? parsedData["6"] : [parsedData["6"]])
        : [],
      warnings: parsedData.warnings || parsedData.avertissements || parsedData["7"] || ""
    };
  } catch (error) {
    console.error("Erreur lors du parsing JSON:", error);
    console.log("Contenu brut:", content);
    
    // Créer un résultat formaté à partir du texte brut
    return extractInformationFromText(content);
  }
}

export function extractInformationFromText(text: string): PartTechnicalInfo {
  return {
    function: extractSection(text, "Fonction", ["Installation", "Guide"]) || 
              extractSection(text, "Description", ["Installation", "Guide"]) ||
              "Information non disponible",
    compatibleEquipment: extractEquipmentList(text) || [],
    installation: extractSection(text, "Installation", ["Symptômes", "Défaillance"]) || 
                  extractSection(text, "Guide", ["Symptômes", "Défaillance"]) ||
                  "Information non disponible",
    symptoms: extractSection(text, "Symptômes", ["Entretien", "Maintenance"]) || 
              extractSection(text, "Défaillance", ["Entretien", "Maintenance"]) || 
              "Information non disponible",
    maintenance: extractSection(text, "Entretien", []) || 
                extractSection(text, "Maintenance", []) || 
                "Information non disponible",
    alternatives: extractAlternativesList(text) || [],
    warnings: extractSection(text, "Avertissement", []) ||
              extractSection(text, "Attention", []) || 
              ""
  };
}

function extractEquipmentList(text: string): string[] {
  const equipmentSectionRegex = /(?:équipements? compatibles?|compatible avec)[\s\:]+([^]*?)(?:\n\n|\n[A-Z]|$)/i;
  const equipmentMatch = text.match(equipmentSectionRegex);
  
  if (equipmentMatch && equipmentMatch[1]) {
    // Extraire les éléments de liste ou séparés par virgules
    const listItems = equipmentMatch[1].split(/[\n,]/).map(item => {
      // Nettoyer les puces de liste et les espaces
      return item.replace(/^[\s\-\*•]+|[\s\-\*•]+$/g, '').trim();
    }).filter(item => item.length > 0);
    
    return listItems.length > 0 ? listItems : [];
  }
  
  return [];
}

function extractAlternativesList(text: string): string[] {
  const alternativesSectionRegex = /(?:alternatives|pièces? similaires|références? alternatives)[\s\:]+([^]*?)(?:\n\n|\n[A-Z]|$)/i;
  const alternativesMatch = text.match(alternativesSectionRegex);
  
  if (alternativesMatch && alternativesMatch[1]) {
    // Extraire les éléments de liste ou séparés par virgules
    const listItems = alternativesMatch[1].split(/[\n,]/).map(item => {
      // Nettoyer les puces de liste et les espaces
      return item.replace(/^[\s\-\*•]+|[\s\-\*•]+$/g, '').trim();
    }).filter(item => item.length > 0);
    
    return listItems.length > 0 ? listItems : [];
  }
  
  return [];
}

function extractSection(text: string, startSection: string, endSections: string[]): string | null {
  const startRegex = new RegExp(`${startSection}[\\s\\:]+`, 'i');
  const startMatch = text.match(startRegex);
  if (!startMatch) return null;
  
  const startPos = startMatch.index + startMatch[0].length;
  let endPos = text.length;
  
  if (endSections && endSections.length > 0) {
    for (const endSection of endSections) {
      const endRegex = new RegExp(`${endSection}[\\s\\:]+`, 'i');
      const endMatch = text.substring(startPos).match(endRegex);
      if (endMatch) {
        const newEndPos = startPos + endMatch.index;
        if (newEndPos < endPos) endPos = newEndPos;
      }
    }
  }
  
  return text.substring(startPos, endPos).trim();
}
