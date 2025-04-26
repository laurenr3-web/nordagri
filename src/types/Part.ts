
export interface Part {
  id: number;
  name: string;
  partNumber: string;
  category: string;
  compatibility: number[];  // Changed from string[] to number[]
  manufacturer: string;
  price: number;
  stock: number;
  location: string;
  reorderPoint: number;
  image: string;
  
  // Champs pour la rétrocompatibilité
  description?: string;
  reference?: string;
  compatibleWith?: number[];  // Changed from string[] to number[]
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
