
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
            content: "Vous êtes un expert technique agricole specialisé dans les équipements agricoles. Répondez uniquement au format JSON."
          },
          {
            role: "user",
            content: `Fournissez des informations techniques détaillées sur la pièce agricole avec référence ${partReference}${nameInfo}. Incluez: 
            1. Fonction et utilisation
            2. Equipements compatibles (liste)
            3. Guide d'installation
            4. Symptômes de défaillance
            5. Conseils d'entretien et maintenance
            6. Alternatives possibles (liste)
            7. Avertissements importants

            Retournez uniquement un objet JSON structuré avec ces informations.`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });
      
      const content = response.data.choices[0].message.content;
      let jsonData;
      
      try {
        // Tenter d'extraire le JSON de la réponse
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                          content.match(/```\n([\s\S]*?)\n```/) ||
                          content.match(/{[\s\S]*?}/);
                          
        if (jsonMatch) {
          jsonData = JSON.parse(jsonMatch[0].replace(/```json\n|```\n|```/g, ''));
        } else {
          // Si pas de bloc JSON explicite, essayer de parser toute la réponse
          jsonData = JSON.parse(content);
        }
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
      
      // Normalisation et transformation en format standard
      return {
        function: jsonData.function || jsonData.utilisation || jsonData["1"] || "Information non disponible",
        compatibleEquipment: Array.isArray(jsonData.compatibleEquipment) 
          ? jsonData.compatibleEquipment 
          : jsonData.equipementsCompatibles 
          ? (Array.isArray(jsonData.equipementsCompatibles) ? jsonData.equipementsCompatibles : [jsonData.equipementsCompatibles])
          : jsonData["2"]
          ? (Array.isArray(jsonData["2"]) ? jsonData["2"] : [jsonData["2"]])
          : [],
        installation: jsonData.installation || jsonData.guide || jsonData["3"] || "Information non disponible",
        symptoms: jsonData.symptoms || jsonData.defaillance || jsonData["4"] || "Information non disponible",
        maintenance: jsonData.maintenance || jsonData.entretien || jsonData["5"] || "Information non disponible",
        alternatives: Array.isArray(jsonData.alternatives) 
          ? jsonData.alternatives 
          : jsonData["6"]
          ? (Array.isArray(jsonData["6"]) ? jsonData["6"] : [jsonData["6"]])
          : [],
        warnings: jsonData.warnings || jsonData.avertissements || jsonData["7"] || ""
      };
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
  }
};

