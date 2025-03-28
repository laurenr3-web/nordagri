
import { PartTechnicalInfo } from './types';
import { extractInformationFromText } from './utils/textExtraction';

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
