
import { partsSearchService } from './searchService';
import { partsPriceService } from './priceService';

// Re-export the types
export * from './types';

// Create a consolidated service object
export const perplexityPartsService = {
  searchParts: partsSearchService.searchParts,
  comparePartPrices: partsPriceService.comparePartPrices
};

// Export individual services
export { partsSearchService, partsPriceService };
