import { perplexityClient, checkApiKey } from './client';
import { toast } from 'sonner';

/**
 * Service pour récupérer des informations techniques sur des pièces agricoles
 * Simplifié et plus robuste
 */
export const partsTechnicalService = {
  /**
   * Récupère des informations techniques sur une pièce
   */
  async getPartInfo(partNumber: string, partContext?: string, categories: string[] = []): Promise<any> {
    try {
      console.log(`🔍 Recherche technique pour: ${partNumber}`);
      
      // Vérifier la clé API
      if (!checkApiKey()) {
        toast.error("Clé API manquante", {
          description: "Configurez VITE_PERPLEXITY_API_KEY dans .env.development"
        });
        return null;
      }
      
      // Construction du prompt avec les informations disponibles
      const categoryInfo = categories.length > 0 
        ? `Cette référence correspond probablement à ${categories.join(" ou ")}. ` 
        : '';
      
      const contextInfo = partContext 
        ? `Je recherche des informations sur ${partContext}. ` 
        : `Je recherche des informations sur la pièce ${partNumber}. `;
      
      const prompt = `${contextInfo}${categoryInfo}Fournissez les informations suivantes:
      1. Description et fonction de la pièce
      2. Instructions d'installation
      3. Symptômes de défaillance
      4. Entretien recommandé
      5. Avertissements d'utilisation
      6. Pièces alternatives
      
      IMPORTANT: Structurez votre réponse en JSON avec le format {"function":"Description détaillée", "installation":"Instructions", "symptoms":"Symptômes", "maintenance":"Entretien", "warnings":"Avertissements", "alternatives":["Pièce1", "Pièce2"]}`;
      
      console.log("Prompt:", prompt);
      
      // Appel API avec un modèle plus petit et des paramètres optimisés
      const response = await perplexityClient.post('/chat/completions', {
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en pièces détachées agricoles. Répondez uniquement avec un JSON valide."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 800
      });
      
      const content = response.data.choices[0].message.content;
      console.log("Réponse brute:", content);
      
      // Tentative de parse simple
      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.log("Parsing JSON direct échoué, tentative d'extraction...");
        
        // Extraire un bloc JSON
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        content.match(/(\{[\s\S]*?\})/);
        
        if (jsonMatch && jsonMatch[1]) {
          try {
            return JSON.parse(jsonMatch[1]);
          } catch (error) {
            console.error("Extraction de JSON échouée");
          }
        }
        
        // Retour d'urgence: Formater nous-mêmes le résultat
        return {
          function: content.substring(0, 500),
          installation: "Information non disponible",
          symptoms: "Information non disponible",
          maintenance: "Information non disponible",
          warnings: "Information non disponible",
          alternatives: []
        };
      }
    } catch (error: any) {
      console.error("❌ Erreur recherche technique:", error);
      toast.error("Erreur recherche technique", {
        description: error.message || "Une erreur est survenue"
      });
      return null;
    }
  },

  // Fonctions utilitaires conservées
  extractSection(text: string, keyword: string, endKeyword?: string): string {
    const lowercaseText = text.toLowerCase();
    const keywordIndex = lowercaseText.indexOf(keyword.toLowerCase());
    
    if (keywordIndex === -1) return '';
    
    let endIndex = text.length;
    if (endKeyword) {
      const endKeywordIndex = lowercaseText.indexOf(endKeyword.toLowerCase(), keywordIndex + keyword.length);
      if (endKeywordIndex !== -1) {
        endIndex = endKeywordIndex;
      }
    } else {
      // Chercher le prochain point ou saut de ligne
      const nextPeriod = text.indexOf('.', keywordIndex + keyword.length);
      const nextNewline = text.indexOf('\n', keywordIndex + keyword.length);
      
      if (nextPeriod !== -1 && (nextNewline === -1 || nextPeriod < nextNewline)) {
        endIndex = nextPeriod + 1;
      } else if (nextNewline !== -1) {
        endIndex = nextNewline;
      }
    }
    
    return text.substring(keywordIndex, endIndex).trim();
  }
};
