
const partNumberPatterns = [
  { 
    pattern: /^[0-9]{4}-[0-9]{4}$/, 
    categories: ["Filtre", "Filtre à huile", "Filtre à carburant"],
    manufacturers: ["Kubota", "John Deere"]
  },
  { 
    pattern: /^RE[0-9]{6}$/, 
    categories: ["Filtre"],
    manufacturers: ["John Deere"] 
  },
  { 
    pattern: /^[A-Z]{2}[0-9]{5}$/, 
    categories: ["Capteur", "Interrupteur"],
    manufacturers: ["Case IH", "New Holland"] 
  },
  // Plus de modèles...
];

export function identifyPartCategory(partNumber: string): { 
  categories: string[], 
  manufacturers: string[] 
} {
  for (const entry of partNumberPatterns) {
    if (entry.pattern.test(partNumber)) {
      return {
        categories: entry.categories,
        manufacturers: entry.manufacturers
      };
    }
  }
  
  // Analyse basée sur préfixes/suffixes connus
  if (partNumber.startsWith("F") || partNumber.includes("FILT")) {
    return { 
      categories: ["Filtre"], 
      manufacturers: [] 
    };
  }
  
  return { categories: [], manufacturers: [] };
}
