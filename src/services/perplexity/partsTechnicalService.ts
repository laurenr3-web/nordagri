
import { perplexityClient } from './client';

export interface PartTechnicalInfo {
  function: string;
  compatibleEquipment: string[];
  installation: string;
  symptoms: string;
  maintenance: string;
  alternatives?: string[];
  warnings?: string;
  technicalSpecs?: Record<string, string>;
  diagrams?: string[];
}

export const partsTechnicalService = {
  async getPartInfo(partNumber: string, partName?: string): Promise<PartTechnicalInfo> {
    try {
      console.log(`Recherche d'informations techniques pour ${partNumber} (${partName || 'Sans nom'})`);
      
      const response = await perplexityClient.post('/chat/completions', {
        model: "sonar-medium-online",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert technique en équipement agricole. Retournez les informations au format JSON."
          },
          {
            role: "user",
            content: `Fournissez des informations techniques complètes sur la pièce référence ${partNumber} ${partName ? `(nom: ${partName})` : ''}. Décrivez sa fonction, ses équipements compatibles, les symptômes indiquant qu'elle doit être remplacée, les étapes d'installation et les conseils de maintenance. Format: JSON.`
          }
        ],
        temperature: 0.2
      });
      
      // Extraction du JSON de la réponse
      const content = response.data.choices[0].message.content;
      let parsedData;
      
      try {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                          content.match(/```\n([\s\S]*?)\n```/) ||
                          content.match(/{[\s\S]*?}/);
                          
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0].replace(/```json\n|```\n|```/g, ''));
        } else {
          parsedData = JSON.parse(content);
        }
      } catch (parseError) {
        console.error("Erreur lors du parsing des informations techniques:", parseError);
        
        // Formatage de secours en cas d'échec du parsing
        return {
          function: "Information non disponible. La pièce n'a pas pu être identifiée précisément.",
          compatibleEquipment: [],
          installation: "Aucune information d'installation disponible.",
          symptoms: "Aucune information disponible sur les symptômes de défaillance.",
          maintenance: "Aucune recommandation de maintenance disponible."
        };
      }
      
      // Transformation en format uniforme
      return {
        function: parsedData.function || parsedData.fonction || parsedData.description || "Non spécifié",
        compatibleEquipment: Array.isArray(parsedData.compatibleEquipment || parsedData.equipementsCompatibles) 
          ? (parsedData.compatibleEquipment || parsedData.equipementsCompatibles) 
          : [parsedData.compatibleEquipment || parsedData.equipementsCompatibles || "Information non disponible"],
        installation: parsedData.installation || parsedData.installationSteps || parsedData.etapesInstallation || "Aucune instruction disponible",
        symptoms: parsedData.symptoms || parsedData.failureSymptoms || parsedData.symptomes || parsedData.signesDefaillance || "Non spécifié",
        maintenance: parsedData.maintenance || parsedData.maintenanceRecommendations || parsedData.entretien || "Aucune recommandation disponible",
        alternatives: parsedData.alternatives || parsedData.alternativeParts || parsedData.piecesAlternatives,
        warnings: parsedData.warnings || parsedData.precautions || parsedData.avertissements,
        technicalSpecs: parsedData.technicalSpecs || parsedData.specifications || parsedData.specsDetails,
        diagrams: parsedData.diagrams || parsedData.schemas
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des informations techniques:", error);
      throw error;
    }
  }
};
