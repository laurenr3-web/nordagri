
import { perplexityClient } from './client';

/**
 * Service pour récupérer des informations techniques sur des pièces agricoles
 */
export const partsTechnicalService = {
  /**
   * Récupère des informations techniques sur une pièce
   * 
   * @param partNumber Numéro de référence de la pièce
   * @param partContext Contexte additionnel (fabricant, etc.)
   * @param categories Catégories possibles de la pièce identifiées
   * @returns Informations techniques structurées
   */
  async getPartInfo(partNumber: string, partContext?: string, categories: string[] = []): Promise<any> {
    try {
      console.log(`Recherche d'informations techniques pour ${partContext || partNumber}`);
      
      // Construire un prompt enrichi avec les informations de catégorie
      let enrichedPrompt = `Recherchez des informations techniques détaillées sur la pièce agricole ${partContext || partNumber}`;
      
      if (categories.length > 0) {
        enrichedPrompt += `. Cette référence correspond probablement à ${categories.join(" ou ")}`;
      }
      
      enrichedPrompt += `. Fournissez les informations suivantes structurées en JSON : 
      1. Une description et la fonction de la pièce
      2. Instructions d'installation et de montage
      3. Symptômes courants de défaillance ou de dysfonctionnement
      4. Entretien et maintenance recommandés
      5. Avertissements et précautions d'utilisation
      6. Pièces alternatives ou compatibles`;
      
      const response = await perplexityClient.post('/chat/completions', {
        model: "sonar-medium-online", 
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en pièces détachées agricoles. Répondez uniquement avec des informations techniques précises et structurées en JSON."
          },
          {
            role: "user",
            content: enrichedPrompt
          }
        ],
        temperature: 0.1
      });
      
      const content = response.data.choices[0].message.content;
      
      try {
        // Essayer de parser le JSON directement
        return JSON.parse(content);
      } catch (parseError) {
        console.log("Parsing direct du JSON échoué, extraction du bloc...");
        
        // Essayer d'extraire un bloc JSON
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) ||
                          content.match(/(\{[\s\S]*\})/);
                          
        if (jsonMatch && jsonMatch[1]) {
          try {
            return JSON.parse(jsonMatch[1]);
          } catch (blockParseError) {
            console.error("Erreur lors du parsing du bloc JSON:", blockParseError);
          }
        }
        
        // Fallback : retourner le contenu sous forme de texte
        return {
          function: content,
          rawResponse: content
        };
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des informations techniques:", error);
      throw error;
    }
  }
};
