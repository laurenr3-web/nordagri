
import { perplexityClient } from '@/integrations/perplexity/client';
import { Part, PartPriceInfo } from '@/types/Part';

export const partsSearchService = {
  // Rechercher des pièces par description ou référence
  async searchParts(query: string): Promise<Part[]> {
    try {
      const response = await perplexityClient.post('/chat/completions', {
        model: "sonar-medium-online",
        messages: [
          {
            role: "system",
            content: "Vous êtes un assistant spécialisé dans les pièces détachées agricoles. Retournez les informations au format JSON."
          },
          {
            role: "user",
            content: `Recherchez des informations sur la pièce agricole suivante: ${query}. Incluez la référence, le nom, la description, la compatibilité et si possible le prix estimé.`
          }
        ],
        temperature: 0.2
      });
      
      // Extraction et transformation des données du format JSON
      const content = response.data.choices[0].message.content;
      let parsedData;
      try {
        // Essayer d'extraire le JSON de la réponse
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                          content.match(/```\n([\s\S]*?)\n```/) ||
                          content.match(/{[\s\S]*?}/);
                          
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0].replace(/```json\n|```\n|```/g, ''));
        } else {
          // Si pas de bloc JSON explicite, essayer de parser toute la réponse
          parsedData = JSON.parse(content);
        }
      } catch (parseError) {
        console.error("Erreur lors du parsing de la réponse JSON:", parseError);
        // Format de secours si le parsing échoue
        parsedData = { 
          results: [{ 
            name: query, 
            description: content,
            reference: "N/A",
            compatibleWith: "Inconnu",
            estimatedPrice: "Inconnu"
          }] 
        };
      }
      
      // Transformer en format utilisable par l'application
      return parsedData.results.map((item: any) => ({
        id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: item.name || "Sans nom",
        partNumber: item.reference || item.partNumber || "N/A",
        reference: item.reference || item.partNumber || "N/A",
        description: item.description || "",
        category: item.category || "Non catégorisé",
        compatibility: item.compatibleWith || [],
        compatibleWith: item.compatibleWith || [],
        manufacturer: item.manufacturer || "Inconnu",
        price: 0,
        stock: 0,
        location: "",
        reorderPoint: 0,
        image: item.imageUrl || "",
        estimatedPrice: item.estimatedPrice || item.price || null,
        inStock: false,
        isFromSearch: true, // Marquer comme provenant d'une recherche
        imageUrl: item.imageUrl || null
      }));
    } catch (error) {
      console.error("Erreur lors de la recherche de pièces:", error);
      throw error;
    }
  },

  // Comparer les prix pour une pièce spécifique
  async comparePartPrices(partReference: string, partName: string): Promise<PartPriceInfo[]> {
    try {
      const response = await perplexityClient.post('/chat/completions', {
        model: "sonar-medium-online",
        messages: [
          {
            role: "system",
            content: "Vous êtes un assistant spécialisé dans la recherche de prix de pièces détachées agricoles. Retournez les résultats au format JSON."
          },
          {
            role: "user",
            content: `Recherchez les prix actuels pour la pièce agricole avec la référence: ${partReference}, nom: ${partName}. Incluez le nom du fournisseur, le prix, le lien vers la page produit, et la disponibilité. Limitez-vous à 5 résultats maximum.`
          }
        ],
        temperature: 0.2
      });
      
      // Extraction des données JSON
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
        console.error("Erreur lors du parsing des prix:", parseError);
        return [];
      }
      
      // Transformer en format utilisable
      return (parsedData.results || []).map((item: any) => ({
        supplier: item.supplier || "Inconnu",
        price: item.price || "N/A",
        currency: item.currency || "EUR",
        link: item.link || null,
        isAvailable: item.isAvailable || item.availability || false,
        deliveryTime: item.deliveryTime || "Non spécifié",
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error("Erreur lors de la comparaison des prix:", error);
      throw error;
    }
  }
};
