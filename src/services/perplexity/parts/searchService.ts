
import { Part } from '@/types/Part';
import { partsApi } from './api';
import { partsParser } from './parser';
import { SearchConfig, PartSearchResult } from './types';

/**
 * Service for searching parts using Perplexity API
 */
export const partsSearchService = {
  /**
   * Search for parts by description or reference
   */
  async searchParts(query: string): Promise<Part[]> {
    try {
      console.log('Démarrage de la recherche pour:', query);
      
      const messages = [
        {
          role: "system",
          content: "Vous êtes un assistant spécialisé dans les pièces détachées agricoles. Retournez les informations au format JSON."
        },
        {
          role: "user",
          content: `Recherchez des informations sur la pièce agricole suivante: ${query}. Incluez la référence, le nom, la description, la compatibilité et si possible le prix estimé.`
        }
      ];
      
      const content = await partsApi.executeQuery(messages);
      
      // Parse the JSON response
      const parsedData = partsParser.parseJsonResponse(content);
      const normalizedData = partsParser.normalizeSearchResponse(parsedData, content);
      
      // Transform to application format
      return this.transformSearchResults(normalizedData.results);
      
    } catch (error) {
      console.error("Erreur lors de la recherche de pièces:", error);
      return [];
    }
  },

  /**
   * Transform search results to application Part format
   */
  transformSearchResults(results: PartSearchResult[]): Part[] {
    return results.map((item: PartSearchResult, index: number) => {
      // Convert string IDs to numbers if they're provided as strings
      let compatibilityArray: number[] = [];
      
      if (Array.isArray(item.compatibleWith)) {
        compatibilityArray = item.compatibleWith
          .map(entry => {
            // Try to extract numeric IDs from strings like "Model 123" -> 123
            const matches = /\d+/.exec(entry);
            return matches ? parseInt(matches[0]) : 0;
          })
          .filter(id => id > 0); // Filter out any zeros or invalid conversions
      }
      
      return {
        id: Date.now() + index, // Utiliser un timestamp + index comme ID numérique unique
        name: item.name || "Sans nom",
        partNumber: item.reference || item.partNumber || "N/A",
        category: item.category || "Non catégorisé",
        compatibility: compatibilityArray, // Convert strings to numbers
        manufacturer: item.manufacturer || "Inconnu",
        price: 0,
        stock: 0,
        location: "",
        reorderPoint: 0,
        image: item.imageUrl || "",
        description: item.description || "",
        reference: item.reference || item.partNumber || "N/A",
        compatibleWith: item.compatibleWith || [],
        estimatedPrice: item.estimatedPrice || item.price || null,
        inStock: false,
        isFromSearch: true,
        imageUrl: item.imageUrl || null
      };
    });
  }
};
