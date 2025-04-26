
import { searchParts } from './searchService';
// import { comparePartPrices } from './priceService'; // Uncomment if this exists

// Re-export the functions directly
export * from './searchService';
// export * from './priceService'; // Uncomment if this exists

// Create a consolidated service object
export const perplexityPartsService = {
  searchParts,
  // comparePartPrices // Uncomment if this exists
};
