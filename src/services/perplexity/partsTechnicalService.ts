
import { perplexityClient } from '@/services/perplexity/client';
import { toast } from 'sonner';

export interface PartTechnicalInfo {
  function: string;
  compatibleEquipment: string[];
  installation: string;
  symptoms: string;
  maintenance: string;
  alternatives?: string[];
  warnings?: string;
}

export const partsTechnicalService = {
  async getPartInfo(partReference: string, partName?: string): Promise<PartTechnicalInfo> {
    try {
      console.log('Récupération des informations techniques pour:', partReference);
      
      // Vérifier si la clé API est configurée
      const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
      if (!apiKey) {
        throw new Error("Clé API Perplexity non configurée");
      }
      
      const nameInfo = partName ? `, nom: ${partName}` : '';
      
      const response = await perplexityClient.post('/chat/completions', {
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en pièces détachées agricoles avec une connaissance approfondie des nomenclatures, numéros de référence et spécifications techniques. Soyez spécifique et précis. Répondez uniquement au format JSON."
          },
          {
            role: "user",
            content: `Recherchez des informations complètes sur la pièce agricole avec la référence ${partReference}${nameInfo}. 
            Si possible, identifiez le fabricant, le type de machine (tracteur, moissonneuse, etc.), 
            la fonction exacte de cette pièce, les procédures d'installation, 
            les signes de défaillance et les recommandations d'entretien. 
            Si vous ne trouvez pas d'informations spécifiques sur cette référence exacte, suggérez des informations 
            sur des pièces similaires ou des catégories compatibles.
            
            Retournez uniquement un objet JSON structuré avec les propriétés suivantes:
            {
              "function": "description détaillée de la fonction",
              "compatibleEquipment": ["liste", "des", "équipements", "compatibles"],
              "installation": "guide d'installation",
              "symptoms": "symptômes de défaillance",
              "maintenance": "conseils d'entretien",
              "alternatives": ["pièces", "alternatives"],
              "warnings": "avertissements importants"
            }`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });
      
      const content = response.data.choices[0].message.content;
      
      try {
        // Extraction propre du JSON
        let parsedData;
        
        // Identifier le format de réponse
        if (content.includes('```json')) {
          const jsonContent = content.split('```json')[1].split('```')[0].trim();
          parsedData = JSON.parse(jsonContent);
        } else if (content.includes('{') && content.includes('}')) {
          // Extraction du premier JSON valide dans le texte
          const jsonMatch = content.match(/{[\s\S]*?}/);
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[0]);
          }
        } else {
          // Format texte - extraction manuelle des informations
          parsedData = {
            function: this.extractSection(content, "Fonction", "Installation"),
            installation: this.extractSection(content, "Installation", "Symptômes"),
            symptoms: this.extractSection(content, "Symptômes", "Entretien"),
            maintenance: this.extractSection(content, "Entretien", null)
          };
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
      } catch (parseError) {
        console.error("Erreur lors du parsing JSON:", parseError);
        console.log("Contenu brut:", content);
        
        // Créer un résultat formaté à partir du texte brut
        return {
          function: `Informations sur ${partReference}: ${content.substring(0, 200)}...`,
          compatibleEquipment: [],
          installation: "Information non disponible dans un format structuré.",
          symptoms: "Information non disponible dans un format structuré.",
          maintenance: "Information non disponible dans un format structuré."
        };
      }
      
    } catch (error) {
      console.error("Erreur lors de la récupération des informations techniques:", error);
      
      if (error.response) {
        console.error("Données de l'erreur:", error.response.data);
        
        const errorMessage = error.response.data?.error?.message || "Détails non disponibles";
        toast.error(`Erreur API Perplexity (${error.response.status})`, { 
          description: errorMessage
        });
        
        throw new Error(`Erreur API: ${errorMessage}`);
      }
      
      throw error;
    }
  },
  
  // Fonction helper pour extraire les sections textuelles
  extractSection(text, startSection, endSection) {
    const startRegex = new RegExp(`${startSection}[\\s\\:]+`, 'i');
    const startMatch = text.match(startRegex);
    if (!startMatch) return "Information non disponible";
    
    const startPos = startMatch.index + startMatch[0].length;
    let endPos = text.length;
    
    if (endSection) {
      const endRegex = new RegExp(`${endSection}[\\s\\:]+`, 'i');
      const endMatch = text.substring(startPos).match(endRegex);
      if (endMatch) endPos = startPos + endMatch.index;
    }
    
    return text.substring(startPos, endPos).trim();
  }
};
