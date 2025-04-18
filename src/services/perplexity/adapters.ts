
import { Part } from '@/types/Part';
import { PerplexityPart, PerplexityPriceResult } from '@/types/PerplexityTypes';
import { ensureNumberId } from '@/utils/typeGuards';

/**
 * Convertit une pièce format Perplexity en format application
 * 
 * @param perplexityPart Objet pièce au format retourné par Perplexity
 * @returns Objet pièce au format de l'application
 */
export function convertToAppPart(perplexityPart: PerplexityPart): Part {
  // Conversion du format Perplexity vers le format de l'application
  return {
    id: ensureNumberId(perplexityPart.id),
    name: perplexityPart.name,
    partNumber: perplexityPart.partNumber || perplexityPart.reference,
    reference: perplexityPart.reference,
    description: perplexityPart.description || '',
    category: perplexityPart.category || 'Général',
    manufacturer: perplexityPart.manufacturer || '',
    price: typeof perplexityPart.price === 'string' 
      ? parseFloat(perplexityPart.price) 
      : (perplexityPart.price || 0),
    stock: 0, // Par défaut à 0, à ajuster par l'utilisateur
    location: '',
    reorderPoint: 5, // Valeur par défaut
    image: perplexityPart.imageUrl || 'https://placehold.co/100x100/png',
    compatibility: [],
    // Champs pour la rétrocompatibilité
    compatibleWith: [],
    quantity: 0,
    minimumStock: 5,
    estimatedPrice: perplexityPart.price,
    inStock: false,
    isFromSearch: true,
    imageUrl: perplexityPart.imageUrl,
  };
}

/**
 * Convertit un résultat de prix Perplexity en format de l'application
 * 
 * @param priceResult Résultat de prix au format Perplexity
 * @returns Objet prix au format de l'application
 */
export function convertToPriceInfo(priceResult: PerplexityPriceResult) {
  return {
    supplier: priceResult.vendor,
    price: priceResult.price,
    currency: priceResult.currency,
    link: priceResult.url || null,
    isAvailable: priceResult.availability === 'En stock',
    deliveryTime: priceResult.estimatedDelivery || 'Non spécifié',
    lastUpdated: priceResult.lastUpdated,
  };
}

/**
 * Fonction utilitaire pour s'assurer que l'ID est au bon format
 * 
 * @param id ID pouvant être une chaîne ou un nombre
 * @returns ID converti en nombre si possible
 */
export function normalizePartId(id: string | number): number {
  if (typeof id === 'string') {
    // Tente de convertir la chaîne en nombre
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error("L'identifiant fourni n'est pas un nombre valide");
    }
    return numericId;
  }
  return id;
}
