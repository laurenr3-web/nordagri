
export interface Part {
  id: string | number;
  name: string;
  partNumber: string;
  category: string;
  compatibility: string[];
  manufacturer: string;
  price: number;
  stock: number;
  location: string;
  reorderPoint: number;
  image: string;
  
  // Champs pour la rétrocompatibilité
  description?: string;
  reference?: string;
  compatibleWith?: string[];
  purchasePrice?: number;
  quantity?: number;
  minimumStock?: number;
  estimatedPrice?: number | string | null;
  inStock?: boolean;
  isFromSearch?: boolean;
  imageUrl?: string | null;
}

export interface PartPriceInfo {
  supplier: string;
  vendor?: string;
  price: string | number;
  currency: string;
  link?: string | null;
  url?: string;
  isAvailable?: boolean;
  availability?: string;
  deliveryTime?: string;
  estimatedDelivery?: string;
  shippingCost?: string | number;
  lastUpdated: string;
  condition?: string;
}

export interface PartFilter {
  category?: string;
  manufacturer?: string;
  inStock?: boolean;
  searchTerm?: string;
}

// Technical info interface for part search
export interface PartTechnicalInfo {
  id?: string | number;
  name?: string;
  reference?: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  compatibility?: string[];
  compatibleWith?: string[];
  price?: number | string;
  imageUrl?: string;
  stock?: number;
  minimumStock?: number;
  location?: string;
}

// Price information interface
export interface PriceItem {
  vendor: string;
  price: number | string;
  currency: string;
  url: string;
  availability: string;
  shipping?: number | string;
  deliveryTime?: string;
  condition?: string;
}
