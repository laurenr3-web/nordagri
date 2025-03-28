
/**
 * Utility functions for extracting structured information from text responses
 */

/**
 * Extracts a section of text between a start section marker and optional end section markers
 */
export function extractSection(text: string, startSection: string, endSections: string[]): string | null {
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

/**
 * Extracts a list of compatible equipment from text
 */
export function extractEquipmentList(text: string): string[] {
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

/**
 * Extracts a list of alternative parts from text
 */
export function extractAlternativesList(text: string): string[] {
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

/**
 * Utility function to extract structured information from unstructured text
 */
export function extractInformationFromText(text: string): {
  function: string;
  compatibleEquipment: string[];
  installation: string;
  symptoms: string;
  maintenance: string;
  alternatives: string[];
  warnings: string;
} {
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
