
import { Part, PartPriceInfo } from '@/types/Part';

// Types for search responses
export interface SearchResponse {
  results: PartSearchResult[];
}

export interface PartSearchResult {
  name?: string;
  reference?: string;
  partNumber?: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  compatibleWith?: string[];
  price?: string | number;
  estimatedPrice?: string | number;
  imageUrl?: string;
}

// Configuration for search requests
export interface SearchConfig {
  query: string;
  includePrice?: boolean;
  includeCompatibility?: boolean;
}

// Configuration for price comparison requests
export interface PriceComparisonConfig {
  partReference: string;
  partName: string;
  partManufacturer?: string;
}
