
export interface Part {
  id: number | string;
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
  description?: string;
  reference?: string;
  compatibleWith?: string[];
  estimatedPrice?: number | string | null;
  inStock?: boolean;
  isFromSearch?: boolean;
  imageUrl?: string | null;
}

export interface PartPriceInfo {
  supplier: string;
  price: string | number;
  currency: string;
  link: string | null;
  isAvailable: boolean;
  deliveryTime: string;
  lastUpdated: string;
}
