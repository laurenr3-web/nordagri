
import { PartPriceInfo } from '@/types/Part';
import { partsApi } from './api';
import { partsParser } from './parser';

/**
 * Service for comparing part prices using Perplexity API
 */
export const partsPriceService = {
  /**
   * Compare prices for a specific part
   */
  async comparePartPrices(partReference: string, partName: string, partManufacturer?: string): Promise<PartPriceInfo[]> {
    try {
      console.log('Démarrage de la comparaison de prix pour:', partReference, partName);
      
      const manufacturerInfo = partManufacturer ? `, fabricant: ${partManufacturer}` : '';
      
      const messages = [
        {
          role: "system",
          content: "Vous êtes un assistant spécialisé dans la recherche de prix de pièces détachées agricoles. Retournez les résultats au format JSON."
        },
        {
          role: "user",
          content: `Recherchez les prix actuels pour la pièce agricole avec la référence: ${partReference}, nom: ${partName}${manufacturerInfo}. Incluez le nom du fournisseur, le prix, le lien vers la page produit, et la disponibilité. Limitez-vous à 5 résultats maximum.`
        }
      ];
      
      const content = await partsApi.executeQuery(messages);
      
      // Parse the JSON response
      const parsedData = partsParser.parseJsonResponse(content);
      if (!parsedData) {
        return [];
      }
      
      // Ensure results array exists
      const normalizedData = partsParser.normalizeSearchResponse(parsedData);
      
      // Transform to application format
      return this.transformPriceResults(normalizedData.results || []);
      
    } catch (error) {
      console.error("Erreur lors de la comparaison des prix:", error);
      return [];
    }
  },

  /**
   * Transform price comparison results to application PartPriceInfo format
   */
  transformPriceResults(results: any[]): PartPriceInfo[] {
    // Ensure results is always an array
    const safeResults = Array.isArray(results) ? results : [];
    
    return safeResults.map((item: any) => ({
      supplier: item.supplier || item.vendor || "Inconnu",
      vendor: item.vendor || item.supplier || "Inconnu",
      price: item.price || "N/A",
      currency: item.currency || "EUR",
      link: item.link || null,
      url: item.url || item.link || null,
      isAvailable: Boolean(item.isAvailable || item.availability || false),
      availability: item.availability || (item.isAvailable ? "En stock" : "Non disponible"),
      deliveryTime: item.deliveryTime || "Non spécifié",
      estimatedDelivery: item.estimatedDelivery || item.deliveryTime || "Non spécifié",
      shippingCost: item.shippingCost || null,
      lastUpdated: new Date().toISOString()
    }));
  }
};
