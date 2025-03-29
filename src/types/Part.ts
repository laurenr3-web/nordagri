
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
  
  // Champs optionnels avec types cohérents
  description?: string;
  purchasePrice?: number;
  estimatedPrice?: number | null;
  inStock?: boolean;
  isFromSearch?: boolean;
  
  // Champs pour la compatibilité avec d'autres parties du code
  // Ces champs sont dépréciés et devraient à terme être supprimés
  reference?: string;        // utiliser partNumber à la place
  compatibleWith?: string[]; // utiliser compatibility à la place
  quantity?: number;         // utiliser stock à la place
  minimumStock?: number;     // utiliser reorderPoint à la place
  imageUrl?: string | null;  // utiliser image à la place
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
