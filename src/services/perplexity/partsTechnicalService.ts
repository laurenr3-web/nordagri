
import { perplexityClient } from './client';
import { toast } from 'sonner';

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
      
      // Vérifier si la clé API est configurée
      const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
      if (!apiKey) {
        console.error("Clé API Perplexity manquante");
        toast.error("Clé API manquante", {
          description: "Veuillez configurer la variable VITE_PERPLEXITY_API_KEY dans votre fichier .env"
        });
        return null;
      }
      
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
      
      console.log("Requête à Perplexity API avec prompt:", enrichedPrompt);
      
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
      
      console.log("Réponse de Perplexity API reçue");
      
      if (!response.data || !response.data.choices || !response.data.choices.length) {
        console.error("Format de réponse inattendu:", response.data);
        toast.error("Format de réponse inattendu");
        return null;
      }
      
      const content = response.data.choices[0].message.content;
      console.log("Contenu brut de la réponse:", content);
      
      try {
        // Essayer de parser le JSON directement
        console.log("Tentative de parsing JSON direct");
        return JSON.parse(content);
      } catch (parseError) {
        console.log("Parsing direct du JSON échoué, extraction du bloc...", parseError);
        
        // Essayer d'extraire un bloc JSON
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) ||
                          content.match(/(\{[\s\S]*\})/);
                          
        if (jsonMatch && jsonMatch[1]) {
          try {
            console.log("Bloc JSON extrait, tentative de parsing:", jsonMatch[1]);
            return JSON.parse(jsonMatch[1]);
          } catch (blockParseError) {
            console.error("Erreur lors du parsing du bloc JSON:", blockParseError);
            console.log("Contenu du bloc JSON:", jsonMatch[1]);
          }
        } else {
          console.log("Aucun bloc JSON détecté dans la réponse");
        }
        
        // Tenter une approche moins stricte pour extraire un JSON valide
        try {
          const potentialJson = content.substring(
            content.indexOf('{'), 
            content.lastIndexOf('}') + 1
          );
          console.log("Tentative avec substring:", potentialJson);
          return JSON.parse(potentialJson);
        } catch (substringError) {
          console.error("Extraction par substring échouée:", substringError);
        }
        
        // Fallback : structurer manuellement la réponse en texte
        const formattedResponse = {
          function: content.includes("fonction") ? this.extractSection(content, "fonction", "description") : content,
          description: content.includes("description") ? this.extractSection(content, "description") : undefined,
          installation: content.includes("installation") ? this.extractSection(content, "installation") : undefined,
          symptoms: content.includes("symptômes") ? this.extractSection(content, "symptômes") : undefined,
          maintenance: content.includes("maintenance") ? this.extractSection(content, "maintenance") : undefined,
          warnings: content.includes("avertissements") ? this.extractSection(content, "avertissements") : undefined,
          alternatives: content.includes("alternatives") ? this.extractSection(content, "alternatives") : undefined,
          rawResponse: content
        };
        
        console.log("Réponse formatée manuellement:", formattedResponse);
        return formattedResponse;
      }
    } catch (error: any) {
      console.error("Erreur lors de la récupération des informations techniques:", error);
      
      // Afficher des informations plus détaillées sur l'erreur
      if (error.response) {
        console.error("Détails de la réponse d'erreur:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        toast.error(`Erreur API (${error.response.status})`, {
          description: error.response.data?.error?.message || "Une erreur s'est produite lors de la communication avec Perplexity API"
        });
      } else if (error.request) {
        console.error("Aucune réponse reçue:", error.request);
        toast.error("Erreur de connexion", {
          description: "Aucune réponse reçue de Perplexity API"
        });
      } else {
        console.error("Erreur:", error.message);
        toast.error("Erreur", {
          description: error.message || "Une erreur inattendue s'est produite"
        });
      }
      
      return null;
    }
  },
  
  /**
   * Extrait une section spécifique du texte basée sur un mot-clé
   */
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
