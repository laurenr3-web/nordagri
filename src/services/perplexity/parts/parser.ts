
import { SearchResponse } from './types';

/**
 * Functions for parsing Perplexity API responses
 */
export const partsParser = {
  /**
   * Parse JSON from API response content
   */
  parseJsonResponse(content: string): any {
    try {
      // Try to extract JSON from markdown blocks or direct JSON
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/```\n([\s\S]*?)\n```/) ||
                        content.match(/{[\s\S]*?}/);
                        
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0].replace(/```json\n|```\n|```/g, ''));
      } else {
        // If no JSON block found, attempt to parse entire content
        return JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Erreur lors du parsing de la réponse JSON:", parseError);
      console.log("Contenu de la réponse:", content);
      
      // Return null to indicate parsing failure
      return null;
    }
  },

  /**
   * Normalize response to ensure results array
   */
  normalizeSearchResponse(parsedData: any, fallbackContent?: string): SearchResponse {
    // If parsing failed completely but we have fallback content
    if (!parsedData && fallbackContent) {
      return { 
        results: [{ 
          name: "Résultat non structuré", 
          description: fallbackContent
        }] 
      };
    }
    
    // Ensure results exists as an array
    if (!parsedData.results) {
      // If the response is a single object, wrap it in results array
      return { results: [parsedData] };
    }
    
    return parsedData;
  }
};
